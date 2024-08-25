import { CacheEntry } from './cacheEntry.js';

export class CacheManager {
    constructor(config = {}) {
        this.config = config;
        this.hooks = {
            preSet: [],
            postGet: [],
            eviction: [],
        };
        this.cache = new Map();
    }

    addHook(hookType, fn) {
        if (this.hooks[hookType]) {
            this.hooks[hookType].push(fn);
        } else {
            throw new Error(`Unknown hook type: ${hookType}`);
        }
    }

    runHooks(hookType, ...args) {
        if (this.hooks[hookType]) {
            for (const hook of this.hooks[hookType]) {
                hook(...args);
            }
        }
    }

    set(key, value, ttl = 60000) {
        this.runHooks('preSet', key, value, ttl);
        const entry = new CacheEntry(key, value, ttl);
        this.cache.set(key, entry);
        this.scheduleEviction(key, ttl);
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry || entry.isExpired()) {
            this.cache.delete(key);
            return null;
        }
        this.runHooks('postGet', key, entry.value);
        return entry.value;
    }

    delete(key) {
        this.cache.delete(key);
    }

    scheduleEviction(key, ttl) {
        setTimeout(() => {
            this.runHooks('eviction', key);
            this.cache.delete(key);
        }, ttl);
    }
}
