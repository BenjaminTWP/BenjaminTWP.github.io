function get_svg() {
    const [width, height] = get_dimensions();
    return d3.select("#graph")
        .attr("width", width)
        .attr("height", height);
}

function create_simulation(nodes, edges){
    const [width, height] = get_dimensions();
    return d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
            .id(d => d.id)
            .distance(d => d.length * 22))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));
}

function get_dimensions() {
    const section = document.getElementById("graph-visualizer");
    const width = section.clientWidth;
    const height = section.clientHeight;
    return [width, height];
}

function coordinate_network_to_svg(svg, nodes, edges) {
    const link = svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter().append("line")
        .attr("stroke", "#fea682")
        .attr("stroke-width", 2);


    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 10)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    return [link, node];
}

function disperse_nodes(simulation){
    simulation.on("tick", null);

    simulation.stop();

    for (let i = 0; i < 300; i++) {
        simulation.tick();
    }

}

function add_text_to_edges(svg, edges) {
    svg.selectAll(".link-label")
        .data(edges)
        .enter().append("text")
        .attr("class", "link-label")
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.length || "error: length missing");
}

function generate_network_graph(){
    const [nodes, edges] = generate_network(7, 12);

    d3.select("#graph").selectAll("*").remove(); //Removes any previous graph

    const simulation = create_simulation(nodes, edges)

    const svg = get_svg();

    const [link, node] = coordinate_network_to_svg(svg, nodes, edges);

    disperse_nodes(simulation);

    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    add_text_to_edges(svg,edges);

    function update_link_color(sourceId, targetId, color) {
        d3.selectAll("line")
            .filter(d => d.source.id === sourceId && d.target.id === targetId)
            .attr("stroke", color);
    }


}

function generate_network(n_nodes, n_edges){
    const nodes = [];
    for (let i = 0; i < n_nodes; i++) {
        nodes.push({ id: i });
    }

    const edges = [];
    for (let j = 0; j < n_edges; j++) {

        const source = Math.floor(Math.random() * nodes.length);
        const target = Math.floor(Math.random() * nodes.length);
        const length = Math.floor(Math.random() * 9) + 1;

        if (!duplicate_edge(edges, source, target)){
            edges.push({
                source: source,
                target: target,
                length: length,
            });
        }
        else {j--;}
    }
    return [nodes, edges];
}

function duplicate_edge(edges, source, target){
    for (let i = 0; i < edges.length; i++) {
        if ((edges[i].source === source && edges[i].target === target ) || target === source || (edges[i].source === target && edges[i].target === source)) {
            return true;
        }
    }
    return false;
}