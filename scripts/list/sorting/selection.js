async  function selection_sort() {
    const select = document.getElementById("list_visualization_speed");
    const wait_factor = select.options[select.selectedIndex].value;
    let container = document.querySelector(".list-visualizer");
    let bars = Array.from(container.children);

    for (let i = 0; i < bars.length; i++) {
        let min_index = i;
        let min_value = parseInt(bars[i].getAttribute("data_value"));
        bars[i].style.backgroundColor = RED;

        for (let j = i + 1; j < bars.length; j++) {
            let current_value = parseInt(bars[j].getAttribute("data_value"));
            if (current_value < min_value) {
                min_value = current_value;
                min_index = j;
            }
        }

        bars[min_index].style.backgroundColor = BLUE;

        await wait_for(wait_factor)

        bars[min_index].style.backgroundColor = GREEN;

        if (min_index !== i) {

            container.insertBefore(bars[min_index], bars[i]);
            // If min_index > i, we need to account for the element being moved before its current position
            if (min_index > i) {
                container.insertBefore(bars[i], bars[min_index].nextSibling);
            } else {
                container.insertBefore(bars[i], bars[min_index]);
            }
            bars = Array.from(container.children);
        }
        await wait_for(wait_factor)
    }
}

