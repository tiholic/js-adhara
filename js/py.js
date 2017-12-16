/*class RangeIterator {
    constructor(start, stop, step=1) {
        this.value = start;
        this.stop = stop;
        this.step = step;
    }

    [Symbol.iterator]() { return this; }

    next() {
        let value = this.value;
        if (value + this.step <= this.stop) {
            this.value += this.step;
            return {done: false, value: value};
        } else {
            return {done: true, value: undefined};
        }
    }
}

function range(start, stop, step) {
    return new RangeIterator(start, stop, step);
}*/

function* range(start, stop, step=1){
    for(let i=start; i+step<=stop; i+=step){
        yield i;
    }
}