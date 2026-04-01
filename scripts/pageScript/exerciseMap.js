// ===========================
// Exercise Map - Main Script
// ===========================

// --- Map Setup ---

const map = L.map("map").setView([62, 13], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// --- State ---
// We keep track of layers so we can show/hide them when switching modes.

let currentMode = "biking";        // which mode is active: "running" or "biking"
let bikeView = "pins";             // current biking view: "pins" or "heatmap"
let runningLayer = null;           // the GeoJSON layer for county outlines
let heatmapLayer = null;           // heatmap layer for bike GPS points
let heatmapPoints = [];            // raw [lat, lng] points for the heatmap
let activeRouteOutline = null;     // dark outline behind the route (for visibility)
let activeRoute = null;            // the colored bike route polyline
let activeMarker = null;           // the bike pin that was clicked (so we can restore it)
let activeMarkerIcon = null;       // the original icon of the clicked pin
let endMarker = null;              // "End" label at the end of a route
let infoControl = null;            // Leaflet control for the info panel
let settingsControl = null;        // Leaflet control for settings panel

// All loaded activities (unfiltered) and current filter thresholds
let allActivities = [];
const filters = {
    distance:  { min: 0, max: Infinity },
    speed:     { min: 0, max: Infinity },
    hr:        { min: 0, max: Infinity },
    calories:  { min: 0, max: Infinity }
};

// The default bike pin icon (reused for every marker)
const bikeIcon = L.divIcon({
    className: "",
    html: '<div class="bike-marker">🚴</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// The "Start" icon that replaces the pin when a route is shown
const startIcon = L.divIcon({
    className: "",
    html: '<div class="route-label start-label">Start</div>',
    iconSize: [46, 22],
    iconAnchor: [23, 26]
});

// Create a custom Leaflet control for the info panel (bottom-right of map)
const InfoPanelControl = L.Control.extend({
    options: { position: "bottomright" },

    onAdd: function () {
        const container = L.DomUtil.create("div", "info-panel hidden");

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        this._container = container;
        return container;
    },

    show: function (html) {
        this._container.innerHTML = html;
        this._container.classList.remove("hidden");
    },

    hide: function () {
        this._container.classList.add("hidden");
    }
});

infoControl = new InfoPanelControl();
infoControl.addTo(map);

// --- Heatmap Style Presets ---

const heatmapStyles = {
    glow: {
        radius: 12,
        blur: 16,
        maxZoom: 15,
        gradient: { 0.2: "#1a237e", 0.4: "#4fc3f7", 0.6: "#81c784", 0.8: "#fff176", 1.0: "#ef5350" }
    },
    zones: {
        radius: 12,
        blur: 16,
        maxZoom: 14,
        gradient: { 0.2: "#311b92", 0.4: "#7c4dff", 0.6: "#00e676", 0.8: "#ffea00", 1.0: "#ff1744" }
    }
};
let currentHeatStyle = "glow";

// Create a settings control (top-right of map)
const SettingsControl = L.Control.extend({
    options: { position: "topright" },

    onAdd: function () {
        const wrapper = L.DomUtil.create("div", "settings-control");
        this._wrapper = wrapper;

        const button = L.DomUtil.create("button", "settings-gear", wrapper);
        button.innerHTML = "⚙";
        button.title = "Settings";
        button.onclick = function () {
            wrapper.classList.toggle("open");
        };

        const panel = L.DomUtil.create("div", "settings-panel", wrapper);

        // --- View toggle: Pins vs Heatmap ---
        const viewLabel = L.DomUtil.create("div", "settings-label", panel);
        viewLabel.textContent = "Bike view";

        const viewToggle = L.DomUtil.create("div", "settings-toggle-group", panel);

        const pinsBtn = L.DomUtil.create("button", "setting-btn active", viewToggle);
        pinsBtn.textContent = "Pins";
        pinsBtn.id = "btn-view-pins";

        const heatBtn = L.DomUtil.create("button", "setting-btn", viewToggle);
        heatBtn.textContent = "Heatmap";
        heatBtn.id = "btn-view-heatmap";

        pinsBtn.onclick = function () { switchBikeView("pins"); };
        heatBtn.onclick = function () { switchBikeView("heatmap"); };

        // --- Heatmap style selector ---
        const styleSection = L.DomUtil.create("div", "settings-section", panel);
        styleSection.id = "heatmap-style-section";

        const styleLabel = L.DomUtil.create("div", "settings-label", styleSection);
        styleLabel.textContent = "Heatmap style";

        const styleGroup = L.DomUtil.create("div", "settings-toggle-group vertical", styleSection);

        const styles = [
            { id: "glow",  label: "Warm glow" },
            { id: "zones", label: "Hot zones" }
        ];

        for (let i = 0; i < styles.length; i++) {
            const styleBtn = L.DomUtil.create("button", "setting-btn", styleGroup);
            styleBtn.textContent = styles[i].label;
            styleBtn.id = "btn-heat-" + styles[i].id;
            if (styles[i].id === currentHeatStyle) {
                styleBtn.classList.add("active");
            }
            styleBtn.onclick = switchHeatStyle.bind(null, styles[i].id);
        }

        L.DomEvent.disableClickPropagation(wrapper);
        L.DomEvent.disableScrollPropagation(wrapper);

        this._panel = panel;
        return wrapper;
    },

    show: function () {
        this._wrapper.style.display = "";
    },

    hide: function () {
        this._wrapper.style.display = "none";
        this._wrapper.classList.remove("open");
    }
});

settingsControl = new SettingsControl();
settingsControl.addTo(map);
// Settings visible by default since we now start in biking mode

// --- Running Mode ---

const countyStyle = {
    color: "#77C9D4",
    weight: 2,
    opacity: 0.65
};

fetch("/data/counties.geojson")
    .then(function (response) { return response.json(); })
    .then(function (data) {
        runningLayer = L.geoJSON(data, {
            style: countyStyle,
            onEachFeature: function (feature, layer) {
                const props = feature.properties;
                const name = (props.kom_name && props.kom_name[0]) || "";
                const county = (props.lan_name && props.lan_name[0]) || "";
                layer.bindPopup(name + ", " + county);
            }
        });

        // Only add if we happen to be in running mode when data loads
        if (currentMode === "running") {
            runningLayer.addTo(map);
        }
    });

// --- Biking Mode ---

const bikeClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false
});

// Since biking is now the default, add the cluster group right away
map.addLayer(bikeClusterGroup);

fetch("/data/exercise/activities.json")
    .then(function (response) { return response.json(); })
    .then(function (activities) {
        allActivities = activities;
        setupFilterSliders(activities);
        applyFilters();
        zoomToBikingMarkers();
    });


function createBikingMarkers(activities) {
    bikeClusterGroup.clearLayers();

    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        const startPoint = findFirstGpsPoint(activity.track);
        if (!startPoint) {
            continue;
        }

        const marker = L.marker([startPoint.lat, startPoint.lng], { icon: bikeIcon });

        // We pass both the activity and the marker itself to the click handler
        // so we can swap its icon to "Start" when clicked.
        marker.on("click", onBikeMarkerClick.bind(null, activity, marker));

        bikeClusterGroup.addLayer(marker);
    }
}


function createHeatmapData(activities) {
    heatmapPoints = [];

    for (let i = 0; i < activities.length; i++) {
        const track = activities[i].track;
        for (let j = 0; j < track.length; j++) {
            const point = track[j];
            if (point.lat !== undefined && point.lng !== undefined) {
                heatmapPoints.push([point.lat, point.lng, 0.5]);
            }
        }
    }
}


// --- Filters ---

function getActivitySpeed(activity) {
    if (!activity.total_time_s || activity.total_time_s <= 0) return 0;
    return (activity.total_distance_m / 1000) / (activity.total_time_s / 3600);
}


function setupFilterSliders(activities) {
    const ranges = {
        distance: { min: Infinity, max: 0 },
        speed:    { min: Infinity, max: 0 },
        hr:       { min: Infinity, max: 0 },
        calories: { min: Infinity, max: 0 }
    };

    for (let i = 0; i < activities.length; i++) {
        const a = activities[i];
        const distKm = a.total_distance_m / 1000;
        const speed = getActivitySpeed(a);

        ranges.distance.min = Math.min(ranges.distance.min, distKm);
        ranges.distance.max = Math.max(ranges.distance.max, distKm);
        ranges.speed.min = Math.min(ranges.speed.min, speed);
        ranges.speed.max = Math.max(ranges.speed.max, speed);

        if (a.avg_hr) {
            ranges.hr.min = Math.min(ranges.hr.min, a.avg_hr);
            ranges.hr.max = Math.max(ranges.hr.max, a.avg_hr);
        }
        if (a.total_calories) {
            ranges.calories.min = Math.min(ranges.calories.min, a.total_calories);
            ranges.calories.max = Math.max(ranges.calories.max, a.total_calories);
        }
    }

    ranges.distance.min = Math.floor(ranges.distance.min);
    ranges.distance.max = Math.ceil(ranges.distance.max);
    ranges.speed.min = Math.floor(ranges.speed.min);
    ranges.speed.max = Math.ceil(ranges.speed.max);

    filters.distance = { min: ranges.distance.min, max: ranges.distance.max };
    filters.speed    = { min: ranges.speed.min,    max: ranges.speed.max };
    filters.hr       = { min: ranges.hr.min,       max: ranges.hr.max };
    filters.calories = { min: ranges.calories.min, max: ranges.calories.max };

    const panel = settingsControl._panel;

    const filterSection = L.DomUtil.create("div", "settings-section", panel);
    const filterLabel = L.DomUtil.create("div", "settings-label", filterSection);
    filterLabel.textContent = "Filters";

    const metrics = [
        { key: "distance", label: "Distance",  unit: "km",   range: ranges.distance, step: 1 },
        { key: "speed",    label: "Avg Speed",  unit: "km/h", range: ranges.speed,    step: 1 },
        { key: "hr",       label: "Avg HR",     unit: "bpm",  range: ranges.hr,       step: 1 },
        { key: "calories", label: "Calories",   unit: "kcal", range: ranges.calories, step: 10 }
    ];

    for (let j = 0; j < metrics.length; j++) {
        createFilterRow(filterSection, metrics[j]);
    }
}


function createFilterRow(parent, metric) {
    const range = metric.range;

    if (range.min >= range.max) return;

    const row = L.DomUtil.create("div", "filter-row", parent);

    const header = L.DomUtil.create("div", "filter-header", row);
    const label = L.DomUtil.create("span", "filter-label", header);
    label.textContent = metric.label;
    const rangeDisplay = L.DomUtil.create("span", "filter-range-display", header);
    rangeDisplay.textContent = range.min + " – " + range.max + " " + metric.unit;

    const sliderWrap = L.DomUtil.create("div", "dual-range-wrap", row);

    const track = L.DomUtil.create("div", "dual-range-track", sliderWrap);
    const fill = L.DomUtil.create("div", "dual-range-fill", track);

    const minSlider = L.DomUtil.create("input", "dual-range-input", sliderWrap);
    minSlider.type = "range";
    minSlider.min = range.min;
    minSlider.max = range.max;
    minSlider.step = metric.step;
    minSlider.value = range.min;

    const maxSlider = L.DomUtil.create("input", "dual-range-input", sliderWrap);
    maxSlider.type = "range";
    maxSlider.min = range.min;
    maxSlider.max = range.max;
    maxSlider.step = metric.step;
    maxSlider.value = range.max;

    function updateFill() {
        const totalRange = range.max - range.min;
        if (totalRange <= 0) return;
        const leftPercent = ((parseFloat(minSlider.value) - range.min) / totalRange) * 100;
        const rightPercent = ((range.max - parseFloat(maxSlider.value)) / totalRange) * 100;
        fill.style.left = leftPercent + "%";
        fill.style.right = rightPercent + "%";
    }

    updateFill();

    minSlider.oninput = function () {
        let val = parseFloat(minSlider.value);
        if (val > parseFloat(maxSlider.value)) {
            minSlider.value = maxSlider.value;
            val = parseFloat(maxSlider.value);
        }
        rangeDisplay.textContent = val + " – " + maxSlider.value + " " + metric.unit;
        filters[metric.key].min = val;
        updateFill();
        applyFilters();
    };

    maxSlider.oninput = function () {
        let val = parseFloat(maxSlider.value);
        if (val < parseFloat(minSlider.value)) {
            maxSlider.value = minSlider.value;
            val = parseFloat(minSlider.value);
        }
        rangeDisplay.textContent = minSlider.value + " – " + val + " " + metric.unit;
        filters[metric.key].max = val;
        updateFill();
        applyFilters();
    };
}


function getFilteredActivities() {
    const result = [];

    for (let i = 0; i < allActivities.length; i++) {
        const a = allActivities[i];
        const distKm = a.total_distance_m / 1000;
        const speed = getActivitySpeed(a);
        const hr = a.avg_hr || 0;
        const cal = a.total_calories || 0;

        if (distKm < filters.distance.min || distKm > filters.distance.max) continue;
        if (speed < filters.speed.min || speed > filters.speed.max) continue;
        if (hr < filters.hr.min || hr > filters.hr.max) continue;
        if (cal < filters.calories.min || cal > filters.calories.max) continue;

        result.push(a);
    }

    return result;
}


function applyFilters() {
    const filtered = getFilteredActivities();

    hideInfoPanel();

    createBikingMarkers(filtered);
    createHeatmapData(filtered);

    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
    if (bikeView === "heatmap" && currentMode === "biking") {
        buildHeatmapLayer();
        if (heatmapLayer) {
            heatmapLayer.addTo(map);
        }
    }
}


function switchBikeView(view) {
    if (view === bikeView) {
        return;
    }
    bikeView = view;

    document.getElementById("btn-view-pins").classList.toggle("active", view === "pins");
    document.getElementById("btn-view-heatmap").classList.toggle("active", view === "heatmap");

    const styleSection = document.getElementById("heatmap-style-section");
    if (styleSection) {
        styleSection.style.display = (view === "heatmap") ? "block" : "none";
    }

    hideInfoPanel();

    if (currentMode !== "biking") {
        return;
    }

    if (view === "pins") {
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
        }
        map.addLayer(bikeClusterGroup);
    }

    if (view === "heatmap") {
        map.removeLayer(bikeClusterGroup);
        buildHeatmapLayer();
        if (heatmapLayer) {
            heatmapLayer.addTo(map);
        }
    }
}


function buildHeatmapLayer() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }

    if (heatmapPoints.length === 0) {
        return;
    }

    const style = heatmapStyles[currentHeatStyle];

    heatmapLayer = L.heatLayer(heatmapPoints, {
        radius: style.radius,
        blur: style.blur,
        maxZoom: style.maxZoom,
        gradient: style.gradient
    });
}


function switchHeatStyle(styleId) {
    if (styleId === currentHeatStyle) {
        return;
    }
    currentHeatStyle = styleId;

    const allBtns = ["glow", "zones"];
    for (let i = 0; i < allBtns.length; i++) {
        const btn = document.getElementById("btn-heat-" + allBtns[i]);
        if (btn) {
            btn.classList.toggle("active", allBtns[i] === styleId);
        }
    }

    if (currentMode === "biking" && bikeView === "heatmap") {
        buildHeatmapLayer();
        if (heatmapLayer) {
            heatmapLayer.addTo(map);
        }
    }
}


function findFirstGpsPoint(track) {
    for (let i = 0; i < track.length; i++) {
        if (track[i].lat !== undefined && track[i].lng !== undefined) {
            return track[i];
        }
    }
    return null;
}


function findLastGpsPoint(track) {
    for (let i = track.length - 1; i >= 0; i--) {
        if (track[i].lat !== undefined && track[i].lng !== undefined) {
            return track[i];
        }
    }
    return null;
}


function onBikeMarkerClick(activity, marker) {
    // Remove any previously drawn route and restore previous pin
    clearActiveRoute();

    // Build an array of [lat, lng] from the track (skip points without GPS)
    const routePoints = [];
    for (let i = 0; i < activity.track.length; i++) {
        const point = activity.track[i];
        if (point.lat !== undefined && point.lng !== undefined) {
            routePoints.push([point.lat, point.lng]);
        }
    }

    if (routePoints.length === 0) {
        return;
    }

    // Swap the clicked pin's icon from bike emoji to "Start" label
    activeMarker = marker;
    activeMarkerIcon = marker.getIcon();
    marker.setIcon(startIcon);

    // Draw a dark outline first (thicker, behind the colored line)
    activeRouteOutline = L.polyline(routePoints, {
        color: "#1a1a2e",
        weight: 7,
        opacity: 0.8
    }).addTo(map);

    // Draw the colored route on top
    activeRoute = L.polyline(routePoints, {
        color: "#57A773",
        weight: 4,
        opacity: 0.95
    }).addTo(map);

    // Add "End" label at the last GPS point
    const lastPoint = findLastGpsPoint(activity.track);
    if (lastPoint) {
        const endIcon = L.divIcon({
            className: "",
            html: '<div class="route-label end-label">End</div>',
            iconSize: [38, 22],
            iconAnchor: [19, 26]
        });
        endMarker = L.marker([lastPoint.lat, lastPoint.lng], { icon: endIcon, interactive: false }).addTo(map);
    }

    // Zoom the map to fit the route, with extra padding for the info panel
    map.fitBounds(activeRoute.getBounds(), {
        padding: [50, 50],
        paddingBottomRight: [280, 30]
    });

    showInfoPanel(activity);
}


function clearActiveRoute() {
    // Restore the previously clicked marker back to its bike emoji icon
    if (activeMarker && activeMarkerIcon) {
        activeMarker.setIcon(activeMarkerIcon);
        activeMarker = null;
        activeMarkerIcon = null;
    }

    if (activeRouteOutline) {
        map.removeLayer(activeRouteOutline);
        activeRouteOutline = null;
    }
    if (activeRoute) {
        map.removeLayer(activeRoute);
        activeRoute = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
}


// --- Info Panel ---

function showInfoPanel(activity) {
    const distance = (activity.total_distance_m / 1000).toFixed(1) + " km";
    const duration = formatDuration(activity.total_time_s);
    const avgSpeed = calculateAvgSpeed(activity.total_distance_m, activity.total_time_s);
    const calories = activity.total_calories || "—";
    const avgHr = activity.avg_hr ? activity.avg_hr + " bpm" : "—";
    const maxHr = activity.max_hr ? activity.max_hr + " bpm" : "—";
    const date = formatDate(activity.date);

    let html = '<button class="close-btn" onclick="hideInfoPanel()">&times;</button>';
    html += "<h3>🚴 " + date + "</h3>";
    html += statRow("Distance", distance);
    html += statRow("Duration", duration);
    html += statRow("Avg Speed", avgSpeed);
    html += statRow("Calories", calories);
    html += statRow("Avg HR", avgHr);
    html += statRow("Max HR", maxHr);

    infoControl.show(html);
}


function hideInfoPanel() {
    infoControl.hide();
    clearActiveRoute();
}


function statRow(label, value) {
    return '<div class="stat-row">'
        + '<span class="stat-label">' + label + "</span>"
        + '<span class="stat-value">' + value + "</span>"
        + "</div>";
}


// --- Helper Functions ---

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
        return hours + "h " + minutes + "m";
    }
    return minutes + "m " + seconds + "s";
}


function calculateAvgSpeed(distanceM, timeS) {
    if (timeS <= 0) return "—";
    const speedKmh = (distanceM / 1000) / (timeS / 3600);
    return speedKmh.toFixed(1) + " km/h";
}


function formatDate(dateString) {
    const parts = dateString.split("-");
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return day + " " + month + " " + year;
}


// --- Mode Switching ---

function switchMode(mode) {
    if (mode === currentMode) {
        return;
    }
    currentMode = mode;

    document.getElementById("btn-running").classList.toggle("active", mode === "running");
    document.getElementById("btn-biking").classList.toggle("active", mode === "biking");

    hideInfoPanel();

    if (mode === "running") {
        settingsControl.hide();
        map.removeLayer(bikeClusterGroup);
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
        }
        if (runningLayer) {
            runningLayer.addTo(map);
        }
        map.setView([62, 13], 5);
    }

    if (mode === "biking") {
        settingsControl.show();
        if (runningLayer) {
            map.removeLayer(runningLayer);
        }

        if (bikeView === "pins") {
            map.addLayer(bikeClusterGroup);
        } else if (bikeView === "heatmap") {
            buildHeatmapLayer();
            if (heatmapLayer) {
                heatmapLayer.addTo(map);
            }
        }

        zoomToBikingMarkers();
    }
}


function zoomToBikingMarkers() {
    const bounds = bikeClusterGroup.getBounds();
    if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}