import { addWorkoutPins } from "/scripts/pageScript/mapPins.js";

var map = L.map("map").setView([62, 13], 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var styling = {
    "color": "#77C9D4",
    "weight": 2,
    "opacity": 0.65
};

fetch("/data/counties.geojson")
    .then(res => res.json())
    .then(data => {

        L.geoJSON(data, {style: styling, onEachFeature: onEachCounty}).addTo(map);

    });

function onEachCounty(feature, layer) {
    const props = feature.properties;
    const popupContent = `${props.kom_name?.[0] || ''}, ${props.lan_name?.[0] || ''}`;
    layer.bindPopup(popupContent);
}

fetch("/data/workouts/workout_metadata.json")
    .then(res => res.json())
    .then(workouts => {
        workouts.forEach(w => {
            const [lon, lat] = w.start_coordinates;

            const marker = L.marker([lat, lon]).addTo(map);

            marker.bindPopup(`
        <b>${w.type}</b><br>
        Date: ${w.date}<br>
        Avg HR: ${w.average_heart_rate}
      `);
        });
    });

addWorkoutPins(map, "/data/workouts/workout_metadata.json");