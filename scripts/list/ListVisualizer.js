class ListVisualizer {
    static #instance = null;
    #onGoingListAction = false;
    constructor() {

        if (ListVisualizer.#instance) {
            throw new Error("ListVisualizer follows singleton pattern - you can only create one instance!");
        }
        ListVisualizer.#instance = this;
    }
    static getInstance() {
        if (!ListVisualizer.#instance) {
            ListVisualizer.#instance = new ListVisualizer();
        }
        return ListVisualizer.#instance;
    }

    async  sort() {
        if (!this.#onGoingListAction) {
            this.restBarColors();
            this.#onGoingListAction = true;
            await selection_sort();
            this.#onGoingListAction = false;
        }
    }
    async search(searchValue){
        if (!this.#onGoingListAction) {
            this.#onGoingListAction = true;
            await linear_search(searchValue);
            this.#onGoingListAction = false;
        }
    }

     newBars() {
        if (!this.#onGoingListAction) {
            this.#newBars();
        }
    }


     restBarColors(){
        const container = document.querySelector(".list-visualizer");
        const bars = Array.from(container.children);

        for (let i = 0; i < bars.length; i++){
            bars[i].style.backgroundColor = "white";
        }
    }

    #newBars(){
        let container = document.querySelector(".list-visualizer");
        container.innerHTML = '';

        for (let i = 0; i< 15; i++){

            const value = Math.floor(Math.random() * 30) + 1;

            const bar_holder_div = document.createElement("div");
            bar_holder_div.classList.add("bar");
            bar_holder_div.style.height = `${value * 5}px`;
            bar_holder_div.setAttribute("data_value", parseInt(value))

            const barLabel = document.createElement("label");
            barLabel.classList.add("bar_id");
            barLabel.innerHTML = value.toString();

            bar_holder_div.appendChild(barLabel);
            container.appendChild(bar_holder_div);
        }
    }

}