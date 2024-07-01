class ListVisualizer {
    static #instance = null;
    #onGoingListAction = false;
    #searchAlgorithm;
    #sortAlgorithm;
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
            this.#startLoadIcon();
            this.#sortAlgorithm = new SelectionSort();
            await this.#sortAlgorithm.sort();
            this.#stopLoadIcon();
            this.#onGoingListAction = false;
        }
    }
    async search(searchValue){
        if (!this.#onGoingListAction) {
            this.#onGoingListAction = true;
            this.#startLoadIcon();
            this.#searchAlgorithm = new LinearSearch();
            await this.#searchAlgorithm.search(searchValue);
            this.#stopLoadIcon();
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

            const barDiv = document.createElement("div");
            barDiv.classList.add("bar");
            barDiv.style.height = `${value * 5}px`;
            barDiv.setAttribute("data_value", parseInt(value))

            const barLabel = document.createElement("label");
            barLabel.classList.add("bar-id");
            barLabel.innerHTML = value.toString();

            barDiv.appendChild(barLabel);
            container.appendChild(barDiv);
        }
    }


    #startLoadIcon(){
        if(getListWaitFactor()>0){
            const icon = document.getElementById("listLoadIcon");
            icon.style.visibility = 'visible';
            icon.classList.add('spin');
        }

    }
    #stopLoadIcon(){
        const icon = document.getElementById("listLoadIcon");
        icon.style.visibility = 'hidden';
        icon.classList.remove('spin');
    }

}