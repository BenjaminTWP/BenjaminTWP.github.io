function generate_network_graph(){

    const section = document.getElementById("graph-visualizer");
    const width = section.clientWidth;
    const height = section.clientHeight;

    const [nodes, edges] = generate_network(7, 11);

    d3.select("#graph").selectAll("*").remove(); //Removes any previous graph



    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges)
            .id(d => d.id)
            .distance(d => d.length * 0.5 ))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const svg = d3.select("#graph")
        .attr("width", width)
        .attr("height", height);

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
        .attr("fill", "black");

    simulation.on("tick", null);


    simulation.stop();
    for (let i = 0; i < 300; i++) {
        simulation.tick();
    }

    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

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
        const length = Math.floor(Math.random() * 200);

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