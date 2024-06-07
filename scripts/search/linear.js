/* Well of course it is not going to be anything special */

async function linear_search(wait_factor, search_value){
    const container = document.querySelector(".list-visualizer");
    const bars = Array.from(container.children);
    let found_value = false;

    for (let i = 0; i < bars.length; i++){
        let bar_value = parseInt(bars[i].style.height) / 3

        bars[i].style.backgroundColor = "FireBrick";

        await wait_for(500 * wait_factor)

        if(parseInt(bar_value) === parseInt(search_value)){
            console.log("great success")
            bars[i].style.backgroundColor = "DodgerBlue";
            found_value = true;
        }
        else{
            bars[i].style.backgroundColor = "white";
        }

        await wait_for(500 * wait_factor)

    }
    if (found_value === true){
        return true;
    }
}


async function wait_for(ms){
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve();
        }, ms)
    );
}