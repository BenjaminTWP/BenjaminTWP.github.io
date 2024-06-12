async function dijkstras(nodes, edges, startingNode){

    const select = document.getElementById("graph_visualization_speed");
    const waitFactor = select.options[select.selectedIndex].value;
    let distances = {};
    let previousNode = {};

    nodes.forEach(node=>{
        distances[node.id] = Infinity;
        previousNode[node.id] = null;
    });

    distances[startingNode] = 0;
    highlightNode(startingNode, GREEN);

    let priorityQueue = new PriorityQueue();
    priorityQueue.push([0,startingNode]); //Distance 0 to start node

    while (!priorityQueue.is_empty()) {
        let [currentDistance, currentNode] = priorityQueue.pop();

        for (const edge of edges) {

            //This 'if' is to because we consider the graph non-directed,
            //so the node has to come or go from the current node
            if (edge.source.id === currentNode || edge.target.id === currentNode) {
                let distance = edge.length;
                let neighbor;

                await wait_for(waitFactor);
                highlightNode(currentNode, GREEN);

                if (edge.source.id === currentNode ) {
                    neighbor = edge.target.id;
                }
                else { neighbor = edge.source.id}

                let new_distance = currentDistance + distance;

                if (new_distance < distances[neighbor]){

                    distances[neighbor] = new_distance;
                    highlightNode(neighbor, GREEN);
                    console.log("from " + currentNode + " to " + neighbor);
                    console.log(new_distance);
                    highlightEdge(currentNode, neighbor, RED);
                    highlightEdge(neighbor, currentNode, RED);
                    previousNode[neighbor] = currentNode;
                    priorityQueue.push([new_distance, neighbor]);
                }
            }
        }
    }
}