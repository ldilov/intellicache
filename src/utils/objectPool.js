export class ObjectPool {
    constructor(createFunc, maxPoolSize = 100) {
        this.createFunc = createFunc;
        this.pool = [];
        this.maxPoolSize = maxPoolSize;
    }

    acquire(...args) {
        if (this.pool.length > 0) {
            return this.pool.pop();
        } else {
            return this.createFunc(...args);
        }
    }

    release(obj) {
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(obj);
        }
    }

    size() {
        return this.pool.length;
    }
}
