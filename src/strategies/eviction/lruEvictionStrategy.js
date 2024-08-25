import { EvictionStrategy } from './EvictionStrategy.js';

export class LRUEvictionStrategy extends EvictionStrategy {
  constructor() {
    super();
    this.usageOrder = new Map();
  }

  recordAccess(key) {
    this.usageOrder.delete(key);
    this.usageOrder.set(key, Date.now());
  }

  evict(cache) {
    const leastRecentlyUsed = [...this.usageOrder.entries()].reduce((a, b) =>
      a[1] < b[1] ? a : b,
    )[0];
    this.usageOrder.delete(leastRecentlyUsed);
    cache.delete(leastRecentlyUsed);
  }
}
