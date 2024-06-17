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

    getContainerDimensions() {
        const section = document.getElementById("graph-visualizer");
        const width = section.clientWidth;
        const height = section.clientHeight;
        return [width, height];
    }

    setStartingNode(startingNode){
        this.startingNode = startingNode;
    }

    async shortestPath(){
        if(!this.onGoingGraphAction){
            this.onGoingGraphAction = true;
            this.resetNetworkColor()
            await dijkstras(this.nodes, this.edges, this.startingNode); //will be dynamic in future
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

         const simulation = this.setUpSimulation(this.nodes, this.edges);

         this.svg = this.svgContainer();

         const edgeGraphicsElements = this.setUpEdgesToSVG(this.edges, this.svg);
         const nodeGraphicElements = this.setUpNodesToSVG(this.nodes, this.svg);
         const edgeTextElements = this.textToEdges(this.svg, this.edges);
         const nodeTextElements = this.textToNodes(this.svg, this.nodes,);
         highlightNode(this.startingNode, BLUE);

         simulation.on("tick", ()=>{
             edgeGraphicsElements
                 .attr("x1", d => d.source.x)
                 .attr("y1", d => d.source.y)
                 .attr("x2", d => d.target.x)
                 .attr("y2", d => d.target.y);

             edgeTextElements
                 .attr("x", d => (d.source.x + d.target.x) / 2)
                 .attr("y", d => (d.source.y + d.target.y) / 2);

             nodeGraphicElements
                 .attr("cx", d => d.x)
                 .attr("cy", d => d.y);

             nodeTextElements
                 .attr("x", d => d.x)
                 .attr("y", d => d.y);
         });
         simulation.offline;
    }

     svgContainer() {
        const [width, height] = this.getContainerDimensions();
        return d3.select("#graph")
            .attr("width", width)
            .attr("height", height);
    }

     setUpSimulation(nodes, edges){
        const [width, height] = this.getContainerDimensions();
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges)
                .id(d => d.id)
                .distance(d => d.length * 30))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2));
    }

    setUpEdgesToSVG(edges, svg){
        const links_graphics = svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter().append("line")
        .attr("stroke", "#b2b2b2")
        .attr("stroke-width", 5);

        return links_graphics;
    }
     setUpNodesToSVG(nodes, svg) {
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
        return nodes_graphics;
    }

     resetNetworkColor(){
        d3.selectAll("circle")
            .attr("fill", "white");
        d3.selectAll("line")
            .attr("stroke", "#b2b2b2");
    }

    textToEdges(svg, edges) {
        const textElements = svg.selectAll(".link-label")
            .data(edges)
            .enter().append("text")
            .attr("class", "graph-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d.length || "error: length missing");

        return textElements;
    }

    textToNodes(svg, nodes){
        const nodesAlphabetically = [];
        nodes.forEach(node => {
            nodesAlphabetically.push(ALPHABET[node.id]);
        });

        const textNodes = svg.selectAll(".node-label")
            .data(nodes)
            .enter().append("text")
            .attr("class", "graph-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text((d, i) => nodesAlphabetically[i]);

        return textNodes;
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
            let target = Math.floor(Math.random() * nNodes);
            const length = Math.floor(Math.random() * 9) + 1;

            while (source === target) {
                target = Math.floor(Math.random() * nNodes);
            }

            if (!this.duplicateEdges(edges, source, target)){
                edges.push({
                    source: source,
                    target: target,
                    length: length });
            }
            else {j--;}
        }
        return edges;
    }

     duplicateEdges(edges, source, target){
        for (let i = 0; i < edges.length; i++) {
            if ((edges[i].source === source && edges[i].target === target ) || (edges[i].source === target && edges[i].target === source)) {
                return true;
            }
        }
        return false;
    }
}