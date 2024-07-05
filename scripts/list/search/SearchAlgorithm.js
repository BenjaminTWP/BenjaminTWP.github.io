class SearchAlgorithm {
    #highLightColor = COLOR_FEATHER;
    #foundColor = COLOR_MARINE;
    #defaultColor = "white";

    get highLightColor() {return this.#highLightColor;}
    get foundColor() {return this.#foundColor;}
    get defaultColor() {return this.#defaultColor;}
    async search(){ throw new Error("Method 'search()' must be implemented.");}
}

class LinearSearch extends SearchAlgorithm{
    #barValues;
    constructor() {
        super();
        const listContainer = document.getElementById("listVisualizer");
        this.#barValues = Array.from(listContainer.children);
    }

    async search(searchValue) {
        let foundValue = false;

        for (let i = 0; i < this.#barValues.length; i++) {
            const barValue = parseInt(this.#barValues[i].getAttribute("integerValue"));

            this.#barValues[i].style.backgroundColor = this.highLightColor;
            await wait_for(getListWaitFactor());

            if (barValue === parseInt(searchValue)) {
                this.#barValues[i].style.backgroundColor = this.foundColor;
                foundValue = true;
            } else {
                this.#barValues[i].style.backgroundColor = this.defaultColor;
            }

            await wait_for(getListWaitFactor());
        }
        return foundValue;
    }
}

