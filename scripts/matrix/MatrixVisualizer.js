class MatrixVisualizer {
    static #instance = null;
    #ongoingMatrixAction = false;
    #startPoint = {row: 0, col: 0};
    #matrix = this.#randomizeNewMatrix(5, 6);
    #algorithm;

    constructor() {
        if (MatrixVisualizer.#instance) {
            throw new Error("MatrixVisualizer follows singleton pattern - you can only create one instance!");
        }
        MatrixVisualizer.#instance = this;
    }

    static getInstance() {
        if (!MatrixVisualizer.#instance) {
            MatrixVisualizer.#instance = new MatrixVisualizer();
        }
        return MatrixVisualizer.#instance;
    }

    async matrixAction() {
        if (!this.#ongoingMatrixAction) {
            this.#resetAllCellColors();
            this.#ongoingMatrixAction = true;
            this.#startLoadIcon();
            this.#algorithm = new FloodFill(this.#matrix);
            await this.#algorithm.fill(this.#startPoint);
            this.#stopLoadIcon();
            this.#ongoingMatrixAction = false;
        }
    }

    createNewMatrix() {
        if (!this.#ongoingMatrixAction) {
            this.#ongoingMatrixAction = true;
            this.#matrix = this.#randomizeNewMatrix(8, 8);
            this.#visualizeMatrixElements();
            this.#ongoingMatrixAction = false;
        }
    }

    #randomizeNewMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                let newRandom = Math.floor(Math.random() * 2);
                row.push(newRandom);
            }
            matrix.push(row);
        }
        return matrix;
    }

    #visualizeMatrixElements() {
        const matrixContainer = document.getElementById("matrixContainer");
        matrixContainer.innerHTML = "";

        for (let i = 0; i < this.#matrix.length; i++) {
            let rowDiv = document.createElement("div");
            rowDiv.classList.add("matrix-row");
            for (let j = 0; j < this.#matrix[i].length; j++) {
                let cell = this.#newMatrixCell(i, j);
                rowDiv.appendChild(cell);
                if (i === this.#startPoint.row && j === this.#startPoint.col) {
                    this.#selectStartCell(cell);
                }
            }
            matrixContainer.appendChild(rowDiv);
        }
    }

    #newMatrixCell(i, j) {
        let matrixCell = document.createElement("div");
        matrixCell.classList.add("matrix-cell");
        matrixCell.setAttribute("row", i);
        matrixCell.setAttribute("col", j);
        matrixCell.onclick = () => this.#selectStartCell(matrixCell);
        matrixCell.textContent = this.#matrix[i][j];
        matrixCell.style.cursor = "pointer";
        return matrixCell;
    }

    #selectStartCell(cell) {
        this.#resetAllCellColors();
        this.#startPoint = { row: parseInt(cell.getAttribute("row")), col: parseInt(cell.getAttribute("col")) };
        cell.style.backgroundColor = COLOR_MARINE;
    }

    #resetAllCellColors() {
        const cellContainer = document.querySelectorAll(".matrix-cell");
        cellContainer.forEach(cell => {
            cell.style.backgroundColor = "white";
        });
    }

    #startLoadIcon(){
        if(getMatrixWaitFactor() > 0){
            const icon = document.getElementById("matrixLoadIcon");
            icon.style.visibility = 'visible';
            icon.classList.add('spin');
        }

    }
    #stopLoadIcon(){
        const icon = document.getElementById("matrixLoadIcon");
        icon.style.visibility = 'hidden';
        icon.classList.remove('spin');
    }

}
