class GraphVisualizer {
    static instance = null;

    constructor() {
        if (GraphVisualizer.instance) {
            throw new Error("GraphVisualizer follows singleton - you can only create one");
        }

        this.nodes = [];
        this.edges = [];
        this.startingNode = 0;
        this.onGoingGraphAction = false;
        this.svg = null;

        GraphVisualizer.instance = this;
    }

    static getInstance() {
        if (!GraphVisualizer.instance) {
            GraphVisualizer.instance = new GraphVisualizer();
        }
        return GraphVisualizer.instance;
    }

    setStartingNode(startingNode){
        this.startingNode = startingNode;
    }

    async shortestPath(){
        if(!this.onGoingGraphAction){
            this.onGoingGraphAction = true;
            this.reset_colours_graph_network()
            await dijkstras(this.nodes, this.edges, this.startingNode);
            this.onGoingGraphAction = false;
        }
    }

     newGraphNetwork(){
        if(!this.onGoingGraphAction){
            this.onGoingGraphAction = true;
            this.createNetworkVisualization();
            this.onGoingGraphAction = false;
        }
    }

      createNetworkVisualization() {
        this.nodes = this.createNodes(5);
        this.edges = this.createEdges(8,5);

        d3.select("#graph").selectAll("*").remove(); //Removes any previous graph

         const simulation = this.create_simulation(this.nodes, this.edges)

         this.svg = this.get_svg();

         const [link, node] = this.coordinate_network_to_svg(this.svg, this.nodes, this.edges);

         this.choose_node_color(this.startingNode, BLUE);

         this.disperse_nodes(simulation);

         link
             .attr("x1", d => d.source.x)
             .attr("y1", d => d.source.y)
             .attr("x2", d => d.target.x)
             .attr("y2", d => d.target.y);

         node
             .attr("cx", d => d.x)
             .attr("cy", d => d.y);

         this.add_text_to_edges(this.svg, this.edges);

    }

     choose_node_color(node_Id, color) {
        d3.selectAll("circle")
            .filter(d => d.id === node_Id)
            .attr("fill", color);
    }


     get_dimensions() {
        const section = document.getElementById("graph-visualizer");
        const width = section.clientWidth;
        const height = section.clientHeight;
        return [width, height];
    }

     get_svg() {
        const [width, height] = this.get_dimensions();
        return d3.select("#graph")
            .attr("width", width)
            .attr("height", height);
    }

     create_simulation(nodes, edges){
        const [width, height] = this.get_dimensions();
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges)
                .id(d => d.id)
                .distance(d => d.length * 22))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2));
    }

     coordinate_network_to_svg(svg, nodes, edges) {
        const links_graphics = svg.append("g")
            .selectAll("line")
            .data(edges)
            .enter().append("line")
            .attr("stroke", "#b2b2b2")
            .attr("stroke-width", 5);

        const nodes_graphics = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 18)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("cursor", "pointer")
            .on("click", function (event,d){
                updateStartNode(this, d);
            });

        return [links_graphics, nodes_graphics];
    }



     reset_colours_graph_network(){
        d3.selectAll("circle")
            .attr("fill", "white");
        d3.selectAll("line")
            .attr("stroke", "#b2b2b2");
    }

     disperse_nodes(simulation){
        simulation.on("tick", null);

        simulation.stop();

        for (let i = 0; i < 300; i++) {
            simulation.tick();
        }

    }

     add_text_to_edges(svg, edges) {
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

    createNodes(nNodes){
        const nodes = [];
        for (let i = 0; i < nNodes; i++) {
            nodes.push({id: i});
        }
        return nodes;
    }

    createEdges(nEdges,nNodes){
        const edges = [];
        for (let j = 0; j < nEdges; j++) {
            const source = Math.floor(Math.random() * nNodes);
            const target = Math.floor(Math.random() * nNodes);
            const length = Math.floor(Math.random() * 9) + 1;

            if (!this.duplicate_edge(edges, source, target)){
                edges.push({
                    source: source,
                    target: target,
                    length: length });
            }
            else {j--;}
        }
        return edges;
    }

     duplicate_edge(edges, source, target){
        for (let i = 0; i < edges.length; i++) {
            if ((edges[i].source === source && edges[i].target === target ) || target === source || (edges[i].source === target && edges[i].target === source)) {
                return true;
            }
        }
        return false;
    }



}