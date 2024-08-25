export class EvictionStrategy {
    constructor() {
        if (this.constructor === EvictionStrategy) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * This method should implement the logic for selecting a cache entry to evict.
     * @param {Map} cache - The cache storage map.
     */
    evict(cache) {
        throw new Error("Method 'evict()' must be implemented.");
    }
}
