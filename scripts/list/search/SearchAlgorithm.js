class SearchAlgorithm {
    _highLightColor = COLOR_FEATHER;
    _foundColor = COLOR_MARINE;
    _defaultColor = "white";
    _notFoundColor = "black";
    _barValues;

    async search(){ throw new Error("Method 'search()' must be implemented.");}

    _waitFactor(){
        return getListWaitFactor();
    }

    _prepareBarVisualization(){
        const listContainer = document.getElementById("listVisualizer");
        this._barValues = Array.from(listContainer.children);
        const listVisualizer = ListVisualizer.getInstance();
        listVisualizer.resetBarColors(listContainer);
    }

    _searchValueInArray(bars, searchValue){
        const low = parseInt(bars[0].getAttribute("integerValue"));
        const high = parseInt(bars[bars.length - 1].getAttribute("integerValue"));
        return searchValue >= low && searchValue <= high;
    }
}

class LinearSearch extends SearchAlgorithm{

    async search(searchValue) {
        this._prepareBarVisualization();
        if(this._searchValueInArray(this._barValues, searchValue)){
            await this.#linear(this._barValues, searchValue);
        }
    }

    async #linear(bars, searchValue){
        for (let i = 0; i < bars.length; i++) {
            const barValue = parseInt(bars[i].getAttribute("integerValue"));

            bars[i].style.backgroundColor = this._highLightColor;
            await wait(this._waitFactor());

            if (barValue === parseInt(searchValue)) {
                bars[i].style.backgroundColor = this._foundColor;

            } else if (barValue !== parseInt(searchValue)){
                bars[i].style.backgroundColor = this._defaultColor;
            }

            await wait(this._waitFactor());
        }
    }

}


class BinarySearch extends SearchAlgorithm {
    async search(searchValue) {
        this._prepareBarVisualization();
        await this.#binarySearch(this._barValues, searchValue, 0, this._barValues.length - 1);
    }

    async #binarySearch(bars, searchValue, left, right) {
        if (left > right) {
            await this.#handleValueNotFound();
            return;
        }

        const mid = Math.floor((left + right) / 2);
        const midValue = this.#getIntegerValue(bars[mid]);

        await this.#highlightBar(bars[mid]);

        if (searchValue < midValue) {
            await this.#resetBar(bars[mid]);
            await this.#binarySearch(bars, searchValue, left, mid - 1);
        } else if (searchValue > midValue) {
            await this.#resetBar(bars[mid]);
            await this.#binarySearch(bars, searchValue, mid + 1, right);
        } else {
            await this.#markFoundBar(bars[mid]);
            await this.#searchAdjacent(bars, searchValue, left, mid, right);
        }
    }

    async #searchAdjacent(bars, searchValue, left, mid, right) {
        await this.#searchLeft(bars, searchValue, left, mid - 1);
        await this.#searchRight(bars, searchValue, mid + 1, right);
    }

    async #searchLeft(bars, searchValue, left, mid) {
        while (mid >= left) {
            const midValue = this.#getIntegerValue(bars[mid]);
            if (midValue === parseInt(searchValue)) {
                await this.#markFoundBar(bars[mid]);
                mid--;
            } else {
                break;
            }
        }
    }

    async #searchRight(bars, searchValue, mid, right) {
        while (mid <= right) {
            const midValue = this.#getIntegerValue(bars[mid]);
            if (midValue === parseInt(searchValue)) {
                await this.#markFoundBar(bars[mid]);
                mid++;
            } else {
                break;
            }
        }
    }

    async #highlightBar(bar) {
        bar.style.backgroundColor = this._highLightColor;
        await wait(this._waitFactor());
    }

    async #resetBar(bar) {
        bar.style.backgroundColor = this._defaultColor;
        await wait(this._waitFactor());
    }

    async #markFoundBar(bar) {
        bar.style.backgroundColor = this._foundColor;
        await wait(this._waitFactor());
    }

    async #handleValueNotFound() {
        this._barValues.forEach(bar => bar.style.backgroundColor = this._notFoundColor);
        await wait(this._waitFactor() * 4);
        this._barValues.forEach(bar => bar.style.backgroundColor = this._defaultColor);
    }

    #getIntegerValue(bar) {
        return parseInt(bar.getAttribute("integerValue"));
    }
}






