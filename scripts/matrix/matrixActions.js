function newMatrix(){
    MatrixVisualizer.getInstance().createNewMatrix();
}

//Really slow and efficient search
function highLightCell(row, col, color){
    const allCellsContainer = document.querySelectorAll(".matrix-cell");
    allCellsContainer.forEach(cell => {
        let cellRow = parseInt(cell.getAttribute("row"));
        let cellCol = parseInt(cell.getAttribute("col"));

        if (cellRow === row && cellCol === col){
            cell.style.backgroundColor = color;
        }
    });
}
function flood(){
    MatrixVisualizer.getInstance().matrixAction();
}

function getMatrixWaitFactor() {
    const select = document.getElementById("matrixVisualizationSpeed");
    const waitFactor = select.options[select.selectedIndex].value;
    return parseFloat(waitFactor);
}

function addRow(){
    const matrixVisualizer = MatrixVisualizer.getInstance();
    matrixVisualizer.addRow();
}

function removeRow(){
    const matrixVisualizer = MatrixVisualizer.getInstance();
    matrixVisualizer.removeRow();
}

function addColumn(){
    const matrixVisualizer = MatrixVisualizer.getInstance();
    matrixVisualizer.addColumn();
}
function removeColumn(){
    const matrixVisualizer = MatrixVisualizer.getInstance();
    matrixVisualizer.removeColumn();
}


const matrixInfoIcon = document.getElementById('matrixInfoIcon');
const infoWindow = document.getElementById('matrixInfoWindow');

matrixInfoIcon.addEventListener('mouseenter', function() {
    infoWindow.classList.remove('hidden');
});
matrixInfoIcon.addEventListener('mouseleave', function() {
    infoWindow.classList.add('hidden');
});
