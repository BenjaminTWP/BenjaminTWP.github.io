//* STARTING STATE *//

activateSortButton();
deactivateSearchButton()

const listInfoIcon = document.getElementById('listInfoIcon');
const listInfoWindow = document.getElementById('listInfoWindow');

listInfoIcon.addEventListener('mouseenter', function() {
    listInfoWindow.classList.remove('hidden');
});
listInfoIcon.addEventListener('mouseleave', function() {
    listInfoWindow.classList.add('hidden');
});

function populateSearchableValues() {
    let selectSearchableElement = document.getElementById("searchForValue");
    for (let index = 1; index <= 30; index++) {
        let option = document.createElement("option");
        option.value = index.toString();
        option.textContent = index.toString();
        option.style.textAlign = "center";
        selectSearchableElement.appendChild(option);
    }
}

function newBars() {
    let listVisualizer = ListVisualizer.getInstance();
    listVisualizer.newBars();
    deactivateSearchButton();
}

async function sortBars() {
    let listVisualizer = ListVisualizer.getInstance();
    listVisualizer.sort();
    activateSearchButton();
}
async function searchBars(){
    let listVisualizer = ListVisualizer.getInstance();
    const searchValue = document.getElementById("searchForValue").value;
    listVisualizer.search(searchValue);
}

function activateSortButton(){
    const sortButton = document.getElementById("listSortBarsButton");
    sortButton.disabled = false;
    sortButton.style.boxShadow = "0 0 3px #57BC90";
}

function activateSearchButton(){
    const searchButton = document.getElementById("listSearchBarsButton");
    searchButton.disabled = false;
    searchButton.style.cursor = "pointer";
    searchButton.style.boxShadow = "0 0 3px #57BC90";
}

function deactivateSearchButton(){
    const searchButton = document.getElementById("listSearchBarsButton");
    searchButton.disabled = true;
    searchButton.style.cursor = "auto";
    searchButton.style.boxShadow = "0 0 3px #ff5454";
}

function getListWaitFactor(){
    const select = document.getElementById("listVisualizationSpeed");
    return select.options[select.selectedIndex].value;
}

function addBar(){
    const visualizer = ListVisualizer.getInstance();
    visualizer.addBar();
    deactivateSearchButton()
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


