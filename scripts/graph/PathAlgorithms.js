class PathAlgorithm {

    async shortestPath() {}
}

class Dijkstras extends PathAlgorithm{
    #previousNode = {};
    #distanceToNode = {};
    #pathToNode = {};
    #priorityQueue;
    #startingNode;
    #edges;

    constructor(nodes, edges) {
        super();
        this.#priorityQueue = new PriorityQueue();
        this.#edges = structuredClone(edges);

        nodes.forEach(node => {
            const nodeId = node.id;
            this.#distanceToNode[nodeId] = Infinity;
            this.#previousNode[nodeId] = null;
            this.#pathToNode[nodeId] = [];
        });
    }

    async shortestPath(startingNode) {
        this.#initializeStart(startingNode);
        await this.#processNodes();
    }

    #initializeStart(startingNode) {
        this.#startingNode = startingNode;
        this.#distanceToNode[startingNode] = 0;
        highlightNode(startingNode, COLOR_MARINE);
        this.#priorityQueue.push([0, startingNode]); // Distance is 0 to starting node
    }

    async #processNodes() {
        while (!this.#priorityQueue.is_empty()) {
            const [currentDistance, currentNode] = this.#priorityQueue.pop();

            this.#edges.forEach(edge => {
                if (edge.source.id === currentNode || edge.target.id === currentNode) {
                    this.#updateNeighbor(edge, currentDistance, currentNode);
                }
            });
        }

        await this.#visualizePaths();
    }

    #updateNeighbor(edge, currentDistance, currentNode) {
        const neighbor = (edge.source.id === currentNode) ? edge.target.id : edge.source.id;
        const newDistance = currentDistance + edge.length;

        if (newDistance < this.#distanceToNode[neighbor]) {
            this.#distanceToNode[neighbor] = newDistance;
            this.#pathToNode[neighbor] = [...this.#pathToNode[currentNode], currentNode];
            this.#previousNode[neighbor] = currentNode;
            this.#priorityQueue.push([newDistance, neighbor]);
        }
    }

    async #visualizePaths() {
        const waitFactor = getGraphWaitFactor();

        for (let node in this.#pathToNode) {
            const nodeInt = parseInt(node);

            if (nodeInt !== this.#startingNode) {
                const path = this.#pathToNode[node];
                path.push(nodeInt); // Pushing the end node for easier coding

                await wait(waitFactor);
                highlightNode(nodeInt, COLOR_MARINE);
                await wait(waitFactor);

                for (let i = 0; i < path.length - 1; i++) {
                    const current = path[i];
                    const next = path[i + 1];

                    await this.#highlightPathSegment(current, next, waitFactor);
                }
            }
        }
    }

    async #highlightPathSegment(start, end, waitFactor) {
        highlightEdge(start, end, COLOR_FEATHER);
        highlightEdge(end, start, COLOR_FEATHER);
        await wait(waitFactor);
        highlightEdge(start, end, COLOR_MARINE);
        highlightEdge(end, start, COLOR_MARINE);
    }
}


