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