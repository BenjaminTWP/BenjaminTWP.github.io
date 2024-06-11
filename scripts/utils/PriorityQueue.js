class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    push(element) {
        this.elements.push(element);
        this.elements.sort((a, b) => a[0] - b[0]);
    }

    pop(){
        return this.elements.shift();
    }

    is_empty(){
        return this.elements.length === 0;
    }

}