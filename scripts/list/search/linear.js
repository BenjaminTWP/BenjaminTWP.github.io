async function linear_search(search_value){
    const select = document.getElementById("visualization_speed");
    const wait_factor = select.options[select.selectedIndex].value;
    const container = document.querySelector(".list-visualizer");
    const bars = Array.from(container.children);

    let found_value = false;

    for (let i = 0; i < bars.length; i++){
        let bar_value = parseInt(bars[i].getAttribute("data_value"))

        bars[i].style.backgroundColor = "FireBrick";
        await wait_for(500 * wait_factor)

        if(parseInt(bar_value) === parseInt(search_value)){
            bars[i].style.backgroundColor = "DodgerBlue";
            found_value = true;
        }
        else{
            bars[i].style.backgroundColor = "white";
        }

        await wait_for(500 * wait_factor)

    }
    if (found_value === true){
        return found_value;
    }
}

async function wait_for(ms){
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        }, ms)
    );
}