import { CacheManager } from './cacheManager.js';
import { CacheEntry } from './cacheEntry.js';

export class Cache extends CacheManager {
    constructor(config = {}) {
        super(config);
    }

    createScope(scopeName) {
        if (!this.cache.has(scopeName)) {
            this.cache.set(scopeName, new Map());
        }
    }

    setInScope(scopeName, key, value, ttl) {
        this.createScope(scopeName);
        const scope = this.cache.get(scopeName);
        const entry = new CacheEntry(key, value, ttl);
        scope.set(key, entry);
        this.scheduleEvictionInScope(scopeName, key, ttl);
    }

    getFromScope(scopeName, key) {
        const scope = this.cache.get(scopeName);
        if (scope) {
            const entry = scope.get(key);
            if (!entry || entry.isExpired()) {
                scope.delete(key);
                return null;
            }
            return entry.value;
        }
        return null;
    }

    invalidateScope(scopeName) {
        this.cache.delete(scopeName);
    }

    scheduleEvictionInScope(scopeName, key, ttl) {
        setTimeout(() => {
            const scope = this.cache.get(scopeName);
            if (scope) {
                scope.delete(key);
                if (scope.size === 0) {
                    this.cache.delete(scopeName);
                }
            }
        }, ttl);
    }
}
