class ListVisualizer {

    static #instance = null;
    #container =  document.getElementById("listVisualizer");
    #onGoingListAction = false;
    #totalBars = 15;
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
            this.#onGoingListAction = true;
            this.restBarColors(this.#container);
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
            this.#newSet(this.#container);
        }
    }

     restBarColors(container){
        const bars = Array.from(container.children);

        for (let i = 0; i < bars.length; i++){
            bars[i].style.backgroundColor = "white";
        }
    }

    #newSet(container){
        container.innerHTML = '';

        for (let i = 0; i< this.#totalBars; i++){
            this.#newBar(container);
        }
    }

    #createBarDiv(integerValue){
        const barDiv = document.createElement("div");
        barDiv.classList.add("bar");
        barDiv.style.height = `${integerValue * 5}px`;
        barDiv.setAttribute("integerValue", integerValue.toString());
        return barDiv;
    }

    #createBarLabel(integerValue){
        const barLabel = document.createElement("label");
        barLabel.classList.add("bar-id");
        barLabel.innerHTML = integerValue.toString();
        return barLabel;
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

    addBar(){
        if(!this.#onGoingListAction){
            if(this.#totalBars < 30){
                this.#newBar(this.#container);
                this.#totalBars++;
            }
        }
    }

    #newBar(container){
        const integerValue = Math.floor(Math.random() * 30) + 1;
        const barDiv = this.#createBarDiv(integerValue);
        const barLabel = this.#createBarLabel(integerValue);
        barDiv.appendChild(barLabel);
        container.appendChild(barDiv);
    }

    removeBar(){
        if(!this.#onGoingListAction){
            if(this.#totalBars > 1){
                this.#container.lastChild.remove();
                this.#totalBars--;
            }
        }
    }
}