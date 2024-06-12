async function dijkstras(nodes, edges, startingNode){

    const select = document.getElementById("graph_visualization_speed");
    const wait_factor = select.options[select.selectedIndex].value;
    let distances = {};
    let previous_node = {};

    nodes.forEach(node=>{
        distances[node.id] = Infinity;
        previous_node[node.id] = null;
    });

    console.log(distances);
    console.log(previous_node);


    distances[startingNode] = 0;
    highlightNode(startingNode, GREEN);

    console.log(startingNode);

    let priority_queue = new PriorityQueue();
    priority_queue.push([0,startingNode]); //Distance 0 to start node


    while (!priority_queue.is_empty()) {
        let [current_distance, current_node] = priority_queue.pop();

        for (const edge of edges) {



            //This 'if' is to because we consider the graph non-directed,
            //so the node has to come or go from the current node
            if (edge.source.id === current_node || edge.target.id === current_node) {
                let distance = edge.length;
                let neighbor;

                await wait_for(wait_factor);
                highlightNode(current_node, GREEN);

                if (edge.source.id === current_node ) {
                    neighbor = edge.target.id;
                }
                else { neighbor = edge.source.id}

                let new_distance = current_distance + distance;

                if (new_distance < distances[neighbor]){

                    distances[neighbor] = new_distance;
                    highlightNode(neighbor, GREEN);
                    console.log("from " + current_node + " to " + neighbor);
                    console.log(new_distance);
                    highlightEdge(current_node, neighbor, RED);
                    highlightEdge(neighbor, current_node, RED);
                    previous_node[neighbor] = current_node;
                    priority_queue.push([new_distance, neighbor]);
                }
            }
        }
    }




}