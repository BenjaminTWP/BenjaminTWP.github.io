

let ongoing_list_action = false;


function generate_random_bars(){
    let container = document.querySelector(".list-visualizer");
    container.innerHTML = '';

    for (let i = 0; i< 15; i++){

        const value = Math.floor(Math.random() * 30) + 1;

        const bar_holder_div = document.createElement("div");
        bar_holder_div.classList.add("bar");
        bar_holder_div.style.height = `${value * 3}px`;
        bar_holder_div.setAttribute("data_value", parseInt(value))

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

function new_random_bars() {
    if (!ongoing_list_action) {
        generate_random_bars();
    }
}

async function sort_bars() {
    if (!ongoing_list_action) {
        make_all_bars_white()
        ongoing_list_action = true;
        await selection_sort();
        ongoing_list_action = false;
    }
}
async function search_bars(){
    if (!ongoing_list_action) {
        ongoing_list_action = true;
        await linear_search(document.getElementById("search_value").value);
        ongoing_list_action = false;
    }
}