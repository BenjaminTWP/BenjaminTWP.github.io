import xml.etree.ElementTree as ET
import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, "..", "workouts")
os.makedirs(output_dir, exist_ok=True)

# TCX namespace
ns = {"tcx": "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"}

def workout_extractor():

    for filename in os.listdir("."):
        if filename.lower().endswith(".tcx"):
            tree = ET.parse(filename)
            root = tree.getroot()

            activity = root.find(".//tcx:Activity", ns)
            activity_id = activity.find("tcx:Id", ns).text
            sport_type = activity.attrib.get("Sport")

            workout = {
                "date": activity_id,
                "type": sport_type,
                "total_time_seconds": 0.0,
                "total_distance_meters": 0.0,
                "total_calories": 0,
                "coordinates": [],
                "altitude": [],
                "distance": [],
                "heart_rate": []
            }

            for lap in activity.findall("tcx:Lap", ns):
                workout["total_time_seconds"] += float(lap.find("tcx:TotalTimeSeconds", ns).text)
                workout["total_distance_meters"] += float(lap.find("tcx:DistanceMeters", ns).text)
                workout["total_calories"] += int(lap.find("tcx:Calories", ns).text)

                for tp in lap.findall(".//tcx:Trackpoint", ns):
                    lat = tp.find("tcx:Position/tcx:LatitudeDegrees", ns)
                    lon = tp.find("tcx:Position/tcx:LongitudeDegrees", ns)
                    alt = tp.find("tcx:AltitudeMeters", ns)
                    dist = tp.find("tcx:DistanceMeters", ns)
                    hr = tp.find("tcx:HeartRateBpm/tcx:Value", ns)

                    if None in (lat, lon, alt, dist, hr):
                        continue  # skip incomplete trackpoint

                    workout["coordinates"].append([float(lon.text), float(lat.text)])
                    workout["altitude"].append(float(alt.text))
                    workout["distance"].append(float(dist.text))
                    workout["heart_rate"].append(int(hr.text))

            append_metadata_json(workout)

            out_name = os.path.join(output_dir, activity_id.replace(":", "-") + ".json")
            with open(out_name, "w", encoding="utf-8") as f:
                json.dump(workout, f, indent=2)

            os.remove(filename)


def append_metadata_json(workout):
    meta_file = os.path.join(output_dir, "workout_metadata.json")

    if os.path.exists(meta_file):
        with open(meta_file, "r", encoding="utf-8") as f:
            try:
                meta = json.load(f)
            except json.JSONDecodeError:
                meta = []
    else:
        meta = []

    if not workout["coordinates"] or not workout["heart_rate"]:
        return

    avg_hr = sum(workout["heart_rate"]) / len(workout["heart_rate"])

    meta_entry = {
        "date": workout["date"],
        "type": workout["type"],
        "average_heart_rate": round(avg_hr),
        "start_coordinates": workout["coordinates"][0],
        "end_coordinates": workout["coordinates"][-1]
    }

    meta.append(meta_entry)

    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)


workout_extractor()