class SortAlgorithm {
    async sort(){throw new Error("Method 'sort()' must be implemented.");}
}

class SelectionSort extends SortAlgorithm{
    #bars;
    #listContainer;

    constructor() {
        super();
        this.#listContainer = document.getElementById("listVisualizer");
        this.#bars = Array.from(this.#listContainer.children);
    }

    async sort() {
        for (let i = 0; i < this.#bars.length; i++) {
            let minIndex = i;
            let minValue = parseInt(this.#bars[i].getAttribute("integerValue"));

            for (let j = i + 1; j < this.#bars.length; j++) {
                const currentValue = parseInt(this.#bars[j].getAttribute("integerValue"));
                if (currentValue < minValue) {
                    minValue = currentValue;
                    minIndex = j;
                }
            }

            await this.#highlightBar(minIndex, COLOR_FEATHER);
            await wait(this.#getListWaitFactor());
            await this.#highlightBar(minIndex, COLOR_MARINE);

            if (minIndex !== i) {
                this.#swapBars(i, minIndex);
                this.#bars = Array.from(this.#listContainer.children);
            }
            await wait(this.#getListWaitFactor());
        }
    }

    async #highlightBar(index, color) {
        this.#bars[index].style.backgroundColor = color;
    }

    #swapBars(i, minIndex) {
        this.#listContainer.insertBefore(this.#bars[minIndex], this.#bars[i]);
        if (minIndex > i) {
            this.#listContainer.insertBefore(this.#bars[i], this.#bars[minIndex].nextSibling);
        } else {
            this.#listContainer.insertBefore(this.#bars[i], this.#bars[minIndex]);
        }
    }

    #getListWaitFactor() {
        return getListWaitFactor();
    }
}