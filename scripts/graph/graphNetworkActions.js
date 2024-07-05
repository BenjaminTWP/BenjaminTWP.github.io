function newGraph(){
    GraphVisualizer.getInstance().newGraphNetwork();
}

async function shortestPath(){
    await GraphVisualizer.getInstance().shortestPath();
}

function highlightEdge(source, target, color) {
    d3.selectAll("line")
        .filter(d => d.source.id === source && d.target.id === target)
        .attr("stroke", color);
}

function highlightNode(node, color) {
    d3.selectAll("circle")
        .filter(d => d.id === node)
        .attr("fill", color);
}

function updateStartNode(clicked_circle, current_node){
    GraphVisualizer.getInstance().resetNetworkColor();
    d3.select(clicked_circle).attr("fill", COLOR_MARINE);
    GraphVisualizer.getInstance().setStartingNode(current_node.id);
}

function getGraphWaitFactor(){
    const select = document.getElementById("graphVisualizationSpeed");
    return select.options[select.selectedIndex].value;
}

function addNode(){
    let graphVisualizer = GraphVisualizer.getInstance();
    graphVisualizer.addNode();
}

function removeNode(){
    let graphVisualizer = GraphVisualizer.getInstance();
    graphVisualizer.removeNode();
}

function addEdge(){
    let graphVisualizer = GraphVisualizer.getInstance();
    graphVisualizer.addEdge();
}

function removeEdge(){
    let graphVisualizer = GraphVisualizer.getInstance();
    graphVisualizer.removeEdge();
}

