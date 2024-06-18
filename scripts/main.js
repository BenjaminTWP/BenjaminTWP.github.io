document.addEventListener('DOMContentLoaded', async () => {
    console.log('JavaScript is running!');

    const scriptHandler = new ScriptHandler();
    await scriptHandler.loadScriptsForViews();

    let graphVisualizer = new GraphVisualizer();
    graphVisualizer.newGraphNetwork();

    let listVisualizer = new ListVisualizer();
    listVisualizer.newBars();
    populateSearchableValues();

    let matrixVisualizer = new MatrixVisualizer();
    matrixVisualizer.createNewMatrix();
});