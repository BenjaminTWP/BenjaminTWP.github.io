function populateSearchableValues() {
    let html_selector = document.getElementById("search_value");
    for (let index = 1; index <= 30; index++) {
        let option = document.createElement("option");
        option.value = index.toString();
        option.textContent = index.toString();
        option.style.textAlign = "center";
        html_selector.appendChild(option);
    }
}

function newBars() {
    let listVisualizer = ListVisualizer.getInstance();
    listVisualizer.newBars();
}

async function sortBars() {
    let listVisualizer = ListVisualizer.getInstance();
    listVisualizer.sort();
}
async function searchBars(){
    let listVisualizer = ListVisualizer.getInstance();
    const searchValue = document.getElementById("search_value").value;
    listVisualizer.search(searchValue);
}

