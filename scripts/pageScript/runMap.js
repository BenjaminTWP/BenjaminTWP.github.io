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