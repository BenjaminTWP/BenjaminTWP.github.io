async function dijkstras(nodes, edges, startingNode) {
    console.log("Welcome to Dijkstra's");

    let previousNode = {};
    let distances = {};
    let paths = {};

    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previousNode[node.id] = null;
        paths[node.id] = [];
    });

    distances[startingNode] = 0;
    highlightNode(startingNode, COLOR_MARINE);

    let priorityQueue = new PriorityQueue();
    priorityQueue.push([0, startingNode]); // Distance 0 to start node

    while (!priorityQueue.is_empty()) {
        let [currentDistance, currentNode] = priorityQueue.pop();

        for (const edge of edges) {
            if (edge.source.id === currentNode || edge.target.id === currentNode) {
                let distance = edge.length;
                let neighbor;

                if (edge.source.id === currentNode) {
                    neighbor = edge.target.id;
                } else {
                    neighbor = edge.source.id;
                }

                let new_distance = currentDistance + distance;

                if (new_distance < distances[neighbor]) {
                    distances[neighbor] = new_distance;
                    // Update path to neighbor
                    paths[neighbor] = paths[currentNode].concat(currentNode);
                    previousNode[neighbor] = currentNode;
                    priorityQueue.push([new_distance, neighbor]);
                }
            }
        }
    }

    await visualizePaths(paths, startingNode);
}

async function visualizePaths(paths, startingNode) {
    const select = document.getElementById("graph_visualization_speed");
    const waitFactor = select.options[select.selectedIndex].value;

    for (let node in paths) {

        if (parseInt(node) !== startingNode) {
            let path = paths[node];
            path.push(parseInt(node)); //Pushing the end node makes the following coding easier
            await wait_for(waitFactor);
            highlightNode(parseInt(node), COLOR_MARINE);
            await wait_for(waitFactor);

            for (let i =0; i < paths[node].length - 1; i++){
                highlightEdge(paths[node][i], paths[node][i+1], COLOR_FEATHER);
                highlightEdge(paths[node][i+1], paths[node][i] , COLOR_FEATHER);
                await wait_for(waitFactor);
                highlightEdge(paths[node][i], paths[node][i+1], COLOR_MARINE);
                highlightEdge(paths[node][i+1], paths[node][i] , COLOR_MARINE);
            }
        }
    }
}


