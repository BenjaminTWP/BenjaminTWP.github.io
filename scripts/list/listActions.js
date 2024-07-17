function populateSearchableValues() {
    let html_selector = document.getElementById("searchForValue");
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
    const searchValue = document.getElementById("searchForValue").value;
    listVisualizer.search(searchValue);
}

function getListWaitFactor(){
    const select = document.getElementById("listVisualizationSpeed");
    return select.options[select.selectedIndex].value;
}

function addBar(){
    const visualizer = ListVisualizer.getInstance();
    visualizer.addBar();
}

function removeBar(){
    const visualizer = ListVisualizer.getInstance();
    visualizer.removeBar();
}

function setSearchAlgorithm() {
    const algorithms = {
        LinearSearch: new LinearSearch,
        BinarySearch: new BinarySearch};

    const selectElement = document.getElementById('searchAlgorithm');
    const selectedValue = selectElement.value;

    try {const listVisualizer = ListVisualizer.getInstance();
        listVisualizer.setSearchAlgorithm(algorithms[selectedValue]);
    } catch(error) {throw error;}
}


const listInfoIcon = document.getElementById('listInfoIcon');
const listInfoWindow = document.getElementById('listInfoWindow');

listInfoIcon.addEventListener('mouseenter', function() {
    listInfoWindow.classList.remove('hidden');
});
listInfoIcon.addEventListener('mouseleave', function() {
    listInfoWindow.classList.add('hidden');
});