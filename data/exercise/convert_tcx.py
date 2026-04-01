import os
import json
import xml.etree.ElementTree as ET

# --- CONFIGURATION ---
# Paths relative to the script location (place this script in data/exercise/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TCX_FOLDER = os.path.join(SCRIPT_DIR, "tcx")
JSON_FOLDER = os.path.join(SCRIPT_DIR, "json")
MERGED_FILE = os.path.join(SCRIPT_DIR, "activities.json")

# Minimum distance (in meters) between GPS points in the merged file.
# Lower = more detail but bigger file. Set to 0 to keep all points.
DOWNSAMPLE_DISTANCE_M = 50

# XML namespaces used in Garmin .tcx files
NS = {
    "tc": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2",
    "ext": "http://www.garmin.com/xmlschemas/ActivityExtension/v2",
}


def get_text(element, path):
    """Safely get text from an XML element. Returns None if not found."""
    found = element.find(path, NS)
    if found is not None and found.text is not None:
        return found.text
    return None


def get_float(element, path):
    """Get a float value from an XML element. Returns None if not found."""
    text = get_text(element, path)
    if text is not None:
        return float(text)
    return None


def get_int(element, path):
    """Get an int value from an XML element. Returns None if not found."""
    text = get_text(element, path)
    if text is not None:
        return int(float(text))
    return None


def parse_trackpoint(trackpoint):
    """Parse a single trackpoint XML element into a dictionary."""
    point = {}

    point["time"] = get_text(trackpoint, "tc:Time")

    # Position (lat/lng) — not all trackpoints have this
    position = trackpoint.find("tc:Position", NS)
    if position is not None:
        point["lat"] = get_float(position, "tc:LatitudeDegrees")
        point["lng"] = get_float(position, "tc:LongitudeDegrees")

    point["alt"] = get_float(trackpoint, "tc:AltitudeMeters")
    point["dist"] = get_float(trackpoint, "tc:DistanceMeters")
    point["hr"] = get_int(trackpoint, "tc:HeartRateBpm/tc:Value")

    # Speed is inside the Extensions element
    point["speed"] = get_float(trackpoint, ".//ext:TPX/ext:Speed")

    # Remove keys that are None to keep the JSON clean
    point = {key: value for key, value in point.items() if value is not None}

    return point


def parse_lap(lap):
    """Parse a single lap XML element into a dictionary."""
    lap_data = {}

    lap_data["start_time"] = lap.get("StartTime")
    lap_data["total_time_s"] = get_float(lap, "tc:TotalTimeSeconds")
    lap_data["distance_m"] = get_float(lap, "tc:DistanceMeters")
    lap_data["max_speed"] = get_float(lap, "tc:MaximumSpeed")
    lap_data["calories"] = get_int(lap, "tc:Calories")
    lap_data["avg_hr"] = get_int(lap, "tc:AverageHeartRateBpm/tc:Value")
    lap_data["max_hr"] = get_int(lap, "tc:MaximumHeartRateBpm/tc:Value")
    lap_data["avg_speed"] = get_float(lap, ".//ext:LX/ext:AvgSpeed")

    # Parse all trackpoints in this lap
    trackpoints = lap.findall(".//tc:Trackpoint", NS)
    lap_data["track"] = [parse_trackpoint(tp) for tp in trackpoints]

    # Remove keys that are None
    lap_data = {key: value for key, value in lap_data.items() if value is not None}

    return lap_data


def parse_tcx_file(filepath):
    """Parse a full .tcx file and return a dictionary with all the data."""
    tree = ET.parse(filepath)
    root = tree.getroot()

    # There should be one Activity element
    activity = root.find(".//tc:Activity", NS)
    if activity is None:
        print(f"  Warning: No activity found in {filepath}")
        return None

    sport = activity.get("Sport", "Unknown")
    start_time = get_text(activity, "tc:Id")
    date = start_time[:10] if start_time else "unknown"

    # Parse all laps
    laps = activity.findall("tc:Lap", NS)
    parsed_laps = [parse_lap(lap) for lap in laps]

    # Calculate totals from all laps
    total_distance = sum(lap.get("distance_m", 0) for lap in parsed_laps)
    total_time = sum(lap.get("total_time_s", 0) for lap in parsed_laps)
    total_calories = sum(lap.get("calories", 0) for lap in parsed_laps)

    # Collect all heart rates to calculate overall avg/max
    all_hrs = [lap.get("avg_hr") for lap in parsed_laps if "avg_hr" in lap]
    all_max_hrs = [lap.get("max_hr") for lap in parsed_laps if "max_hr" in lap]
    all_max_speeds = [lap.get("max_speed") for lap in parsed_laps if "max_speed" in lap]

    # Flatten all trackpoints into one list for the full route
    all_track = []
    for lap in parsed_laps:
        all_track.extend(lap.get("track", []))

    # Build the activity dictionary
    activity_data = {
        "sport": sport,
        "date": date,
        "start_time": start_time,
        "total_distance_m": round(total_distance, 1),
        "total_time_s": round(total_time, 1),
        "total_calories": total_calories,
        "avg_hr": round(sum(all_hrs) / len(all_hrs)) if all_hrs else None,
        "max_hr": max(all_max_hrs) if all_max_hrs else None,
        "max_speed": max(all_max_speeds) if all_max_speeds else None,
        "laps": parsed_laps,
        "track": all_track,
    }

    # Remove None values at the top level
    activity_data = {k: v for k, v in activity_data.items() if v is not None}

    return activity_data


def make_output_filename(activity_data, existing_names):
    """
    Create a filename like '2026-03-08_Biking.json'.
    If that name already exists, append a counter: '2026-03-08_Biking_2.json'.
    """
    date = activity_data.get("date", "unknown")
    sport = activity_data.get("sport", "Unknown")
    base_name = f"{date}_{sport}"

    # Check if this name is already taken
    if base_name not in existing_names:
        existing_names.add(base_name)
        return f"{base_name}.json"

    # Find the next available counter
    counter = 2
    while f"{base_name}_{counter}" in existing_names:
        counter += 1

    name_with_counter = f"{base_name}_{counter}"
    existing_names.add(name_with_counter)
    return f"{name_with_counter}.json"


def get_already_converted():
    """
    Read existing .json files to know which activities are already converted.
    Returns a set of (date, sport) tuples and a set of used filenames.
    """
    converted = set()
    used_names = set()

    if not os.path.exists(JSON_FOLDER):
        return converted, used_names

    for filename in os.listdir(JSON_FOLDER):
        if not filename.endswith(".json"):
            continue

        # Track the name (without .json) so we avoid conflicts
        name_without_ext = filename[:-5]
        used_names.add(name_without_ext)

        # Read the file to get the start_time (our unique identifier)
        filepath = os.path.join(JSON_FOLDER, filename)
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                start_time = data.get("start_time")
                if start_time:
                    converted.add(start_time)
        except (json.JSONDecodeError, IOError):
            print(f"  Warning: Could not read {filename}, skipping")

    return converted, used_names


def downsample_track(track, min_distance_m):
    """
    Reduce the number of GPS points by keeping only points that are
    at least min_distance_m apart (based on the cumulative distance field).
    Always keeps the first and last point.
    """
    if min_distance_m <= 0 or len(track) == 0:
        return track

    result = [track[0]]
    last_kept_dist = track[0].get("dist", 0)

    for point in track[1:-1]:
        # Skip points without a distance value
        current_dist = point.get("dist")
        if current_dist is None:
            continue

        if current_dist - last_kept_dist >= min_distance_m:
            result.append(point)
            last_kept_dist = current_dist

    # Always keep the last point
    if len(track) > 1:
        result.append(track[-1])

    return result


def merge_all_json_files():
    """Read all individual .json files and merge them into activities.json."""
    all_activities = []

    if not os.path.exists(JSON_FOLDER):
        return

    for filename in sorted(os.listdir(JSON_FOLDER)):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(JSON_FOLDER, filename)
        try:
            with open(filepath, "r") as f:
                activity = json.load(f)

                # Downsample the track for the merged file
                if "track" in activity:
                    activity["track"] = downsample_track(
                        activity["track"], DOWNSAMPLE_DISTANCE_M
                    )

                # Remove lap data from merged file to save space
                # (full detail is still in the individual json files)
                activity.pop("laps", None)

                all_activities.append(activity)
        except (json.JSONDecodeError, IOError):
            print(f"  Warning: Could not read {filename}, skipping")

    # Sort by start_time so the list is in chronological order
    all_activities.sort(key=lambda a: a.get("start_time", ""))

    with open(MERGED_FILE, "w") as f:
        json.dump(all_activities, f, indent=2)

    print(f"\nMerged {len(all_activities)} activities into {MERGED_FILE}")


def main():
    # Make sure the output folder exists
    os.makedirs(JSON_FOLDER, exist_ok=True)

    # Check which files are already converted
    already_converted, used_names = get_already_converted()
    print(f"Found {len(already_converted)} already converted activities.")

    # Find all .tcx files
    if not os.path.exists(TCX_FOLDER):
        print(f"Error: TCX folder not found at {TCX_FOLDER}")
        print("Please create it and place your .tcx files there.")
        return

    tcx_files = [f for f in os.listdir(TCX_FOLDER) if f.endswith(".tcx")]
    print(f"Found {len(tcx_files)} .tcx files.")

    # Convert each .tcx file
    new_count = 0
    skipped_count = 0

    for tcx_filename in sorted(tcx_files):
        tcx_path = os.path.join(TCX_FOLDER, tcx_filename)

        # Parse the file to check its start_time
        activity_data = parse_tcx_file(tcx_path)
        if activity_data is None:
            continue

        # Skip if already converted (based on start_time)
        if activity_data.get("start_time") in already_converted:
            skipped_count += 1
            continue

        output_name = make_output_filename(activity_data, used_names)
        output_path = os.path.join(JSON_FOLDER, output_name)

        # Write the JSON file
        with open(output_path, "w") as f:
            json.dump(activity_data, f, indent=2)

        print(f"  Converted: {tcx_filename} -> {output_name}")
        new_count += 1

    print(f"\nDone! Converted {new_count} new files, skipped {skipped_count}.")

    # Merge all individual files into one
    merge_all_json_files()


if __name__ == "__main__":
    main()