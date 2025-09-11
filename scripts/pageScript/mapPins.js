export function addWorkoutPins(map, metadataUrl) {
    let activePolyline = null;
    const originalZoom = map.getZoom();
    const zoomedInLevel = 11; // fallback zoom if needed

    fetch(metadataUrl)
        .then(res => res.json())
        .then(workouts => {
            workouts.forEach(w => {
                const [lon, lat] = w.start_coordinates;

                // create marker
                const marker = L.marker([lat, lon]).addTo(map);

                marker.on("click", () => {
                    // remove existing polyline if any
                    if (activePolyline) {
                        map.removeLayer(activePolyline);
                        activePolyline = null;
                    }

                    // fetch full workout JSON
                    fetch(`/data/workouts/${w.date.replace(/:/g, "-")}.json`)
                        .then(res => res.json())
                        .then(fullWorkout => {
                            const latlngs = fullWorkout.coordinates.map(([lon, lat]) => [lat, lon]);
                            activePolyline = L.polyline(latlngs, { color: "black", weight: 3, opacity: 0.7 }).addTo(map);

                            // zoom / pan to fit the entire route
                            map.fitBounds(activePolyline.getBounds(), { padding: [20, 20], animate: true, duration: 1.2 });

                        })
                        .catch(err => console.error("Failed to load workout JSON:", err));
                });

                marker.on("popupclose", () => {
                    if (activePolyline) {
                        map.removeLayer(activePolyline);
                        activePolyline = null;
                    }

                    // zoom out smoothly back to original zoom and position
                    map.flyTo([lat, lon], originalZoom, { animate: true, duration: 1.2 });
                });
            });
        })
        .catch(err => console.error("Failed to load workout metadata:", err));
}
