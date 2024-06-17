document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is running!');

    generate_random_bars();
    populate_searchable_values();

    let graphVisualizer = new GraphVisualizer();
    graphVisualizer.newGraphNetwork();
    let matrixVisualizer = new MatrixVisualizer();
    matrixVisualizer.createNewMatrix();

});
