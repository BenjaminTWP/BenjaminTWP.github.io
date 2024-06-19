class GraphVisualizer {
    static instance = null;

    #nodes = null;
    #edges = null;
    #startingNode = 0;
    #onGoingGraphAction = false;
    #svg = null;
    #simulation = null;
    #edgeElements = null;
    #nodeElements = null;
    #edgeTextElements = null;
    #nodeTextElements = null;

    constructor() {
        if (GraphVisualizer.instance) {
            throw new Error("GraphVisualizer follows singleton - you can only create one");
        }
        GraphVisualizer.instance = this;
    }

    static getInstance() {
        if (!GraphVisualizer.instance) {
            GraphVisualizer.instance = new GraphVisualizer();
        }
        return GraphVisualizer.instance;
    }

    #getContainerDimensions() {
        const section = document.getElementById("graphContentDiv");
        const width = section.clientWidth;
        const height = section.clientHeight;
        return [width, height];
    }

    setStartingNode(startingNode) {
        this.#startingNode = startingNode;
    }

    async shortestPath() {
        if (!this.#onGoingGraphAction) {
            this.#onGoingGraphAction = true;
            this.#startLoadIcon();
            this.resetNetworkColor();
            await dijkstras(this.#nodes, this.#edges, this.#startingNode);
            this.#stopLoadIcon();
            this.#onGoingGraphAction = false;
        }
    }

    newGraphNetwork() {
        if (!this.#onGoingGraphAction) {
            this.#onGoingGraphAction = true;
            this.#createNetworkVisualization();
            this.#onGoingGraphAction = false;
        }
    }

    #createNetworkVisualization() {
        d3.select("#graph").selectAll("*").remove(); // Removes any previous graph

        this.#nodes = this.#createNodes(8);
        this.#edges = this.#createEdges(12, 8);

        this.#svg = this.#svgContainer();
        this.#simulation = this.#setUpSimulation(this.#nodes, this.#edges);

        this.#edgeElements = this.#createEdgeElements(this.#edges, this.#svg);
        this.#nodeElements = this.#createNodeElements(this.#nodes, this.#svg);
        this.#edgeTextElements = this.#createEdgeTextElements(this.#svg, this.#edges);
        this.#nodeTextElements = this.#createNodeTextElements(this.#svg, this.#nodes);
        highlightNode(this.#startingNode, COLOR_MARINE);

        this.#simulation.on("tick", () => {
            this.#updateGraphElements(this.#edgeElements, this.#edgeTextElements, this.#nodeElements, this.#nodeTextElements);
        });
    }

    #svgContainer() {
        const [width, height] = this.#getContainerDimensions();
        const svg = d3.select("#graph")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g");

        window.addEventListener("resize", () => this.#resizeElementsInSVG());

        let currentAngle = 0;
        const drag = d3.drag()
            .on("start", (event) => {
                // Prevent default touch events
                event.sourceEvent.preventDefault();
            })
            .on("drag", (event) => {
                currentAngle += event.dx * 0.5;  // Adjust rotation sensitivity

                // Get the bounding box of the group
                const bbox = g.node().getBBox();
                const cx = bbox.x + bbox.width / 2;
                const cy = bbox.y + bbox.height / 2;

                // Apply transformation to rotate around the center of the bounding box
                g.attr("transform", `rotate(${currentAngle}, ${cx}, ${cy})`);
            });

        svg.call(drag);

        return g;
    }

    #setUpSimulation(nodes, edges) {
        const [width, height] = this.#getContainerDimensions();
        return d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges)
                .id(d => d.id)
                .distance(d => d.length * 22))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("center", d3.forceCenter(width / 2, height / 2));
    }

    #createEdgeElements(edges, svg) {
        let edgeElements;
        edgeElements = svg.append("g")
            .selectAll("line")
            .data(edges)
            .enter().append("line")
            .attr("stroke", COLOR_SLEEK_GREY)
            .attr("stroke-width", 3);

        return edgeElements;
    }

    #createNodeElements(nodes, svg) {
        let nodeElements;
        nodeElements = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 14)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("cursor", "pointer")
            .on("click", function (event, d) {
                updateStartNode(this, d);
            });
        return nodeElements;
    }

    resetNetworkColor() {
        d3.selectAll("circle")
            .attr("fill", "white");
        d3.selectAll("line")
            .attr("stroke", COLOR_SLEEK_GREY);
    }

    #createEdgeTextElements(svg, edges) {
        let textElements;
        textElements = svg.selectAll(".link-label")
            .data(edges)
            .enter().append("text")
            .attr("class", "graph-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(d => d.length || "error: length missing");

        return textElements;
    }

    #createNodeTextElements(svg, nodes) {
        const nodesAlphabetically = [];
        nodes.forEach(node => {
            nodesAlphabetically.push(ALPHABET[node.id]);
        });

        let textNodes;
        textNodes = svg.selectAll(".node-label")
            .data(nodes)
            .enter().append("text")
            .attr("class", "graph-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text((d, i) => nodesAlphabetically[i]);

        return textNodes;
    }

    #createNodes(nNodes) {
        const nodes = [];
        for (let i = 0; i < nNodes; i++) {
            nodes.push({ id: i });
        }
        return nodes;
    }

    #createEdges(nEdges, nNodes) {
        const edges = [];
        for (let j = 0; j < nEdges; j++) {
            const source = Math.floor(Math.random() * nNodes);
            let target = Math.floor(Math.random() * nNodes);
            const length = Math.floor(Math.random() * 5) + 1;

            while (source === target) {
                target = Math.floor(Math.random() * nNodes);
            }

            if (!this.#edgeAllowed(edges, source, target)) {
                edges.push({
                    source: source,
                    target: target,
                    length: length
                });
            } else {
                j--;
            }
        }
        return edges;
    }

    #edgeAllowed(edges, source, target) {
        for (let i = 0; i < edges.length; i++) {
            if ((edges[i].source === source && edges[i].target === target) || (edges[i].source === target && edges[i].target === source)) {
                return true;
            }
        }
        return false;
    }

    #resizeElementsInSVG() {
        const [width, height] = this.#getContainerDimensions();
        this.#svg.attr("width", width).attr("height", height);

        this.#simulation.force("center", d3.forceCenter(width / 2, height / 2));
        this.#simulation.force("charge", d3.forceManyBody().strength(-1000));
        this.#simulation.alpha(1).restart();

        this.#updateGraphElements(this.#edgeElements, this.#edgeTextElements, this.#nodeElements, this.#nodeTextElements);
    }

    #updateGraphElements(edgeGraphicsElements, edgeTextElements, nodeGraphicElements, nodeTextElements) {
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
    }

    #startLoadIcon(){
        if(getGraphWaitFactor()>0){
            const icon = document.getElementById("graphLoadIcon");
            icon.style.visibility = 'visible';
            icon.classList.add('spin');
        }

    }
    #stopLoadIcon(){

        const icon = document.getElementById("graphLoadIcon");
        icon.style.visibility = 'hidden';
        icon.classList.remove('spin');
    }

}
