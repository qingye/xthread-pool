export default class Queue {
    // FIFO（First In First Out）先入先出队列
    _fifo = [];

    enqueue = (job) => {
        this._fifo.push(job);
    };

    dequeue = () => {
        if (this._fifo.length > 0) {
            return this._fifo.shift();
        }
    };
}