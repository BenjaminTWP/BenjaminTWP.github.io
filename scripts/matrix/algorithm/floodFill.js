async function floodFill(startPoint, matrix){

    const floodValue = matrix[startPoint.row][startPoint.col];
    const searchMatrix = createSearchMatrix(matrix);
    searchMatrix[startPoint.row][startPoint.col] = true;
    highLightCell(startPoint.row,startPoint.col, GREEN);

    let toSearch = new Queue(100);


    if(await neighbor(matrix, searchMatrix, -1, 0, 0, 0, startPoint, floodValue)){toSearch.enqueue({row: startPoint.row - 1, col: startPoint.col});}
    if(await neighbor(matrix, searchMatrix, 0, 1, 0, 0, startPoint, floodValue)){toSearch.enqueue({row: startPoint.row, col: startPoint.col + 1});}
    if(await neighbor(matrix, searchMatrix, 0, 0, 1, 0, startPoint, floodValue)){toSearch.enqueue({row: startPoint.row + 1, col: startPoint.col});}
    if(await neighbor(matrix, searchMatrix, 0, 0, 0, -1, startPoint, floodValue)){toSearch.enqueue({row: startPoint.row, col: startPoint.col -1});}

    while(!toSearch.isEmpty()){
        let searchPoint = toSearch.dequeue();
        searchMatrix[searchPoint.row][searchPoint.col] = true;

        if(await neighbor(matrix, searchMatrix, -1, 0, 0, 0, searchPoint, floodValue)){toSearch.enqueue({row: searchPoint.row - 1, col: searchPoint.col});}
        if(await neighbor(matrix, searchMatrix, 0, 1, 0, 0, searchPoint, floodValue)){toSearch.enqueue({row: searchPoint.row, col: searchPoint.col + 1});}
        if(await neighbor(matrix, searchMatrix, 0, 0, 1, 0, searchPoint, floodValue)){toSearch.enqueue({row: searchPoint.row + 1, col: searchPoint.col});}
        if(await neighbor(matrix, searchMatrix, 0, 0, 0, -1, searchPoint, floodValue)){toSearch.enqueue({row: searchPoint.row, col: searchPoint.col -1});}

    }

    console.log("completed... poop")


}

async function searchedValue(searchMatrix, row, col){
    return searchMatrix[row][col];

}
async function correctFloodValue(matrix, floodValue, row, col){
    return matrix[row][col] === floodValue;

}
async function withinBounds(row,col, maxRow, maxCol){
    return row >= 0 && row < maxRow && col >=0 && col < maxCol;
}
async function neighbor(matrix, searchMatrix, up, right, down, left, start, floodValue) {
    const row = up + start.row + down;
    const col = left + +start.col + right;

    await wait_for(0);

    let suitableNeighbor = await withinBounds(row, col, matrix.length, matrix[0].length) && await correctFloodValue(matrix, floodValue, row, col) && !await searchedValue(searchMatrix, row, col);

    if(suitableNeighbor){
        highLightCell(row, col, GREEN);
    }
    return suitableNeighbor;
}

function createSearchMatrix(matrix){
    const searchMatrix = [];

    for (let i = 0; i < matrix.length; i++) {
        let rowSearchMatrix = [];
        for (let j = 0; j < matrix[0].length; j++) {
            rowSearchMatrix.push(false);
        }
        searchMatrix.push(rowSearchMatrix)
    }
    return searchMatrix;
}