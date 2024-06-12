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
    GraphVisualizer.getInstance().reset_colours_graph_network();
    clicked_circle.setAttribute("fill", BLUE);
    GraphVisualizer.getInstance().setStartingNode(current_node.id);
}
