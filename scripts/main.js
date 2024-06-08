document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is running!');
    // Add your JavaScript code here
    generate_random_bars();
    populate_searchable_values();
});

function generate_random_bars(){
    let container = document.querySelector(".list-visualizer");
    container.innerHTML = '';

    for (let i = 0; i< 15; i++){

        const value = Math.floor(Math.random() * 30) + 1;

        const bar_holder_div = document.createElement("div");
        bar_holder_div.classList.add("bar");
        bar_holder_div.style.height = `${value * 3}px`;
        bar_holder_div.setAttribute("data_value", parseInt(value))
        console.log(bar_holder_div.getAttribute("data_value"));

        const barLabel = document.createElement("label");
        barLabel.classList.add("bar_id");
        barLabel.innerHTML = value.toString();

        bar_holder_div.appendChild(barLabel);
        container.appendChild(bar_holder_div);
    }
}

function make_all_bars_white(){
    const container = document.querySelector(".list-visualizer");
    const bars = Array.from(container.children);

    for (let i = 0; i < bars.length; i++){
        bars[i].style.backgroundColor = "white";
    }
}

function populate_searchable_values() {
    let html_selector = document.getElementById("search_value");
    for (let index = 1; index <= 30; index++) {
        let option = document.createElement("option");
        option.value = index.toString();
        option.textContent = index.toString();
        option.style.textAlign = "center";
        html_selector.appendChild(option);
    }
}



