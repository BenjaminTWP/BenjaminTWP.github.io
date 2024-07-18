            //*         *****************************************        //
            //                   General Search Algorithm                //
            //          *****************************************       *//


class SearchAlgorithm {
    _highLightColor = COLOR_FEATHER;
    _foundColor = COLOR_MARINE;
    _defaultColor = "white";
    _notFoundColor = "black";
    _barElements;

    async search(){ throw new Error("Method 'search()' must be implemented.");}

    _waitFactor(){
        return getListWaitFactor();
    }

    _prepareBarVisualization(){
        const listContainer = document.getElementById("listVisualizer");
        this._barElements = Array.from(listContainer.children);
        const listVisualizer = ListVisualizer.getInstance();
        listVisualizer.resetBarColors(listContainer);
    }

    _valueInArray(bars, searchValue){
        const low = this._getIntegerValue(bars[0]);
        return searchValue >= low;
    }

    async _searchLeft(bars, searchValue, left, mid) {
        while (mid >= left) {
            const midValue = this._getIntegerValue(bars[mid]);
            if (midValue === parseInt(searchValue)) {
                await this._markFoundBar(bars[mid]);
                mid--;
            } else {break;}
        }
    }

    async _searchRight(bars, searchValue, mid, right) {
        while (mid <= right || mid < (bars.length)) {
            const midValue = this._getIntegerValue(bars[mid]);
            if (midValue === parseInt(searchValue)) {
                await this._markFoundBar(bars[mid]);
                mid++;
            } else {break;}
        }
    }

    async _highlightBar(bar) {
        bar.style.backgroundColor = this._highLightColor;
        await wait(this._waitFactor());
    }

    async _resetBar(bar) {
        bar.style.backgroundColor = this._defaultColor;
        await wait(this._waitFactor());
    }

    async _markFoundBar(bar) {
        bar.style.backgroundColor = this._foundColor;
        await wait(this._waitFactor());
    }

    async _handleValueNotFound() {
        this._barElements.forEach(bar => bar.style.backgroundColor = this._notFoundColor);
        await wait(this._waitFactor() * 4);
        this._barElements.forEach(bar => bar.style.backgroundColor = this._defaultColor);
    }

    _getIntegerValue(bar) {
        return parseInt(bar.getAttribute("integerValue"));
    }
}

        //*         *****************************************        //
        //                        Linear Search                      //
        //          *****************************************       *//


class LinearSearch extends SearchAlgorithm{

    async search(searchValue) {
        this._prepareBarVisualization();
        if(this._valueInArray(this._barElements, searchValue)){
            await this.#linear(this._barElements, searchValue);
        }
        else {await this._handleValueNotFound()
        }
    }

    async #linear(bars, searchValue) {
        let i = 0;
        let found = false;

        while (i < bars.length && !found) {
            let barValue = this._getIntegerValue(bars[i]);

            if (barValue === parseInt(searchValue)) {
                bars[i].style.backgroundColor = this._foundColor;
                found = true;
                await this._searchRight(bars, searchValue, i, i + 1);
            } else {
                bars[i].style.backgroundColor = this._highLightColor;
                await wait(this._waitFactor());
                bars[i].style.backgroundColor = this._defaultColor;
                await wait(this._waitFactor());
            }
            i++;
        }
        if(!found){await this._handleValueNotFound();}
    }
}

        //*         *****************************************        //
        //                        Binary Search                      //
        //          *****************************************       *//


class BinarySearch extends SearchAlgorithm {
    async search(searchValue) {
        this._prepareBarVisualization();
        await this.#binarySearch(this._barElements, searchValue, 0, this._barElements.length - 1);
    }

    async #binarySearch(bars, searchValue, left, right) {
        if (left > right) {
            await this._handleValueNotFound();
            return;
        }

        const mid = Math.floor((left + right) / 2);
        const midValue = this._getIntegerValue(bars[mid]);

        await this._highlightBar(bars[mid]);

        if (searchValue < midValue) {
            await this._resetBar(bars[mid]);
            await this.#binarySearch(bars, searchValue, left, mid - 1);
        } else if (searchValue > midValue) {
            await this._resetBar(bars[mid]);
            await this.#binarySearch(bars, searchValue, mid + 1, right);
        } else {
            await this._markFoundBar(bars[mid]);
            await this.#searchAdjacent(bars, searchValue, left, mid, right);
        }
    }

    async #searchAdjacent(bars, searchValue, left, mid, right) {
        await this._searchLeft(bars, searchValue, left, mid - 1);
        await this._searchRight(bars, searchValue, mid + 1, right);
    }

}






