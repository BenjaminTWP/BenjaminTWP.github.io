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

        const barLabel = document.createElement("label");
        barLabel.classList.add("bar_id");
        barLabel.innerHTML = value.toString();

        bar_holder_div.appendChild(barLabel);
        container.appendChild(bar_holder_div);
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



