async function dijkstras(){

    let distances = {};
    let previous_node = {};

    nodes.forEach(node_=>{
        distances[node_.id] = Infinity;
        previous_node[node_.id] = null;
    });



    distances[0] = 0; //Index of start-node is not 0, will change to start_node
    choose_node_color(0);

    let priority_queue = new PriorityQueue();
    priority_queue.push([0,0]); //Distance 0 to start node (in this case 0)


    while (!priority_queue.is_empty()) {
        let [current_distance, current_node] = priority_queue.pop();

        edges.forEach(edge => {
            //This 'if' is to because we consider the graph non-directed,
            //so the node has to come or go from the current node
            if (edge.source.id === current_node || edge.target.id === current_node) {
                let distance = edge.length;
                let neighbor;

                if (edge.source.id === current_node ) {
                    neighbor = edge.target.id;
                }
                else { neighbor = edge.source.id}

                let new_distance = current_distance + distance;

                if (new_distance < distances[neighbor]){

                    distances[neighbor] = new_distance;
                    choose_node_color(neighbor);
                    console.log("from " + current_node + " to " + neighbor);
                    choose_edge_color(current_node, neighbor);
                    choose_edge_color(neighbor, current_node);
                    previous_node[neighbor] = current_node;
                    priority_queue.push([new_distance, neighbor]);
                }


            }
        });
    }




}