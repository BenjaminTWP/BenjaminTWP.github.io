class FloodFill {
    #matrix;
    #searchMatrix;
    #queue;
    #floodValue;

    constructor(matrix) {
        this.#matrix = structuredClone(matrix);
        this.#queue = new Queue(100);
    }

    async fill(startPoint) {
        this.#floodValue = this.#matrix[startPoint.row][startPoint.col];
        this.#searchMatrix = this.#createSearchMatrix();
        this.#searchMatrix[startPoint.row][startPoint.col] = true;
        this.#highlightCell(startPoint.row, startPoint.col, COLOR_MARINE);

        await this.#enqueueNeighbors(startPoint);

        while (!this.#queue.isEmpty()) {
            const searchPoint = this.#queue.dequeue();
            await this.#enqueueNeighbors(searchPoint);
        }
    }

    async #enqueueNeighbors(point) {
        if (await this.#isValidNeighbor(point.row - 1, point.col)) {
            this.#queue.enqueue({ row: point.row - 1, col: point.col });
            this.#searchMatrix[point.row - 1][point.col] = true;
        }
        if (await this.#isValidNeighbor(point.row, point.col + 1)) {
            this.#queue.enqueue({ row: point.row, col: point.col + 1 });
            this.#searchMatrix[point.row][point.col + 1] = true;
        }
        if (await this.#isValidNeighbor(point.row + 1, point.col)) {
            this.#queue.enqueue({ row: point.row + 1, col: point.col });
            this.#searchMatrix[point.row + 1][point.col] = true;
        }
        if (await this.#isValidNeighbor(point.row, point.col - 1)) {
            this.#queue.enqueue({ row: point.row, col: point.col - 1 });
            this.#searchMatrix[point.row][point.col - 1] = true;
        }
    }

    async #isValidNeighbor(row, col) {
        if (this.#withinBounds(row, col) && !this.#searchedValue(row, col)) {
            if (this.#correctFloodValue(row, col)) {
                this.#highlightCell(row, col, COLOR_FEATHER);
                await wait(this.getMatrixWaitFactor()).then(() => {
                    this.#highlightCell(row, col, COLOR_MARINE);
                });
                return true;
            } else {
                this.#highlightCell(row, col, "white");
                await wait(this.getMatrixWaitFactor());
            }
        }
        return false;
    }

    #searchedValue(row, col) {
        return this.#searchMatrix[row][col];
    }

    #correctFloodValue(row, col) {
        return this.#matrix[row][col] === this.#floodValue;
    }

    #withinBounds(row, col) {
        return row >= 0 && row < this.#matrix.length && col >= 0 && col < this.#matrix[0].length;
    }

    #createSearchMatrix() {
        return this.#matrix.map(row => row.map(() => false));
    }

    #highlightCell(row, col, color) {
        highLightCell(row, col, color);
    }

    getMatrixWaitFactor() {
        return getMatrixWaitFactor(); // Assuming getMatrixWaitFactor is a globally defined function
    }
}
