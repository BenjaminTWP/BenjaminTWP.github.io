class MatrixVisualizer{

    static instance = null;

    constructor() {
        if (MatrixVisualizer.instance) {
            throw new Error("GraphVisualizer follows singleton - you can only create one");
        }
        this.ongoingMatrixAction = false;
        this.startPoint = [{row:0, col:0}];
        this.matrix = this.randomizeNewMatrix(5,6);
        console.log(this.matrix);
        MatrixVisualizer.instance = this;
    }

    static getInstance(){
        if(!MatrixVisualizer.instance){
            MatrixVisualizer.instance = new MatrixVisualizer();
        }
        return MatrixVisualizer.instance;

    }

    createNewMatrix(){
        if(!this.ongoingMatrixAction){
            this.ongoingMatrixAction = true;
            this.matrix = this.randomizeNewMatrix(5,6);
            this.visualizeAllMatrixElements();
            this.ongoingMatrixAction = false;
        }
    }

    randomizeNewMatrix(rows, cols){
        const matrix = [];
        for(let i = 0; i < rows; i++) {
            let row = [];

            for(let j = 0; j < cols; j++){
                let newRandom = Math.floor(Math.random()*5);
                row.push(newRandom)
            }
            matrix.push(row);
        }
        return matrix;
    }
    visualizeAllMatrixElements(){
        const matrixContainer = document.getElementById("matrix-visualizer");
        matrixContainer.innerHTML = "";

        for(let i = 0; i < this.matrix.length; i++){
            let rowDiv = document.createElement("div");
            rowDiv.classList.add("matrix-row");
            for(let j = 0; j < this.matrix[i].length; j++){
                let matrixCell = document.createElement("div");
                matrixCell.classList.add("matrix-cell");
                matrixCell.textContent = this.matrix[i][j];
                rowDiv.appendChild(matrixCell);
            }
            matrixContainer.appendChild(rowDiv);

        }



    }
}