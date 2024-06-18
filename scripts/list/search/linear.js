async function linear_search(search_value){
    const container = document.querySelector(".list-visualizer");
    const bars = Array.from(container.children);

    let found_value = false;

    for (let i = 0; i < bars.length; i++){
        let bar_value = parseInt(bars[i].getAttribute("data_value"))

        bars[i].style.backgroundColor = COLOR_FEATHER;
        await wait_for(getListWaitFactor());

        if(parseInt(bar_value) === parseInt(search_value)){
            bars[i].style.backgroundColor = COLOR_MARINE;
            found_value = true;
        }
        else{
            bars[i].style.backgroundColor = "white";
        }

        await wait_for(getListWaitFactor());

    }
    if (found_value === true){
        return found_value;
    }
}
