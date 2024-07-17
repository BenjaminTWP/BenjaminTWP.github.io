class SearchAlgorithm {
    _highLightColor = COLOR_FEATHER;
    _foundColor = COLOR_MARINE;
    _defaultColor = "white";
    _barValues;

    async search(){ throw new Error("Method 'search()' must be implemented.");}

    _waitFactor(){
        return getListWaitFactor();
    }

    _getBarValues(){
        const listContainer = document.getElementById("listVisualizer");
        this._barValues = Array.from(listContainer.children);
    }
}

class LinearSearch extends SearchAlgorithm{

    async search(searchValue) {
        this._getBarValues();
        for (let i = 0; i < this._barValues.length; i++) {
            const barValue = parseInt(this._barValues[i].getAttribute("integerValue"));

            this._barValues[i].style.backgroundColor = this._highLightColor;
            await wait(this._waitFactor());

            if (barValue === parseInt(searchValue)) {
                this._barValues[i].style.backgroundColor = this._foundColor;
            } else {
                this._barValues[i].style.backgroundColor = this._defaultColor;
            }
            await wait(this._waitFactor());
        }
    }
}

class BinarySearch extends SearchAlgorithm{
    #leftPivot;
    #rightPivot;

    async search(searchValue) {
        this._getBarValues();
        this.#prepareSearch(this._barValues);

    }

    #prepareSearch(bars){
        this.#leftPivot = 0;
        this.#rightPivot = Math.round(bars.length / 2);

        bars[this.#leftPivot].style.backgroundColor = this._highLightColor;
        bars[this.#rightPivot].style.backgroundColor = this._highLightColor;
    }
}

