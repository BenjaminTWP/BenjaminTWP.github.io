document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is running!');

    let graphVisualizer = new GraphVisualizer();
    graphVisualizer.newGraphNetwork();
    let listVisualizer  = new ListVisualizer();
    listVisualizer.newBars();
    populateSearchableValues();
    let matrixVisualizer = new MatrixVisualizer();
    matrixVisualizer.createNewMatrix();

});