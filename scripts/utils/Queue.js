class Queue {
    #back;
    #front;
    #queue;
    #capacity;
    #size;

    constructor(capacity) {
        this.#queue = new Array(capacity);
        this.#capacity = capacity;
        this.#front = this.#back = this.#size = 0;
    }

    dequeue() {
        if (this.isEmpty()) {
            throw new Error("The queue is empty dimwit");
        }
        const element = this.#queue[this.#front];
        this.#queue[this.#front] = undefined;
        this.#front = (this.#front + 1) % this.#capacity;
        this.#size--;
        return element;
    }

    enqueue(element) {
        if (this.isFull()) {
            throw new Error("The queue is full dimwit");
        }
        this.#queue[this.#back] = element;
        this.#back = (this.#back + 1) % this.#capacity;
        this.#size++;
    }

    isEmpty() {
        return this.#size === 0;
    }

    isFull() {
        return this.#size === this.#capacity;
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error("The queue is empty dimwit");
        }
        return this.#queue[this.#front];
    }
}



