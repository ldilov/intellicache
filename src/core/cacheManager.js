import { HOOK_TYPES } from '../constants/hookTypes.js';
import { CacheEntry } from './cacheEntry.js';
import { HookManager } from './hookManager.js';

export class CacheManager {
  constructor(config = {}) {
    this.config = config;
    this.hookManager = new HookManager();
    this.cache = new Map();
  }

  addHook(hookType, fn) {
    this.hookManager.addHook(hookType, fn);
  }

  set(key, value, ttl = 60000) {
    this.hookManager.runHooks(HOOK_TYPES.PRE_SET, key, value, ttl);
    const entry = new CacheEntry(key, value, ttl);
    this.cache.set(key, entry);
    this._scheduleEviction(key, ttl);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry || entry.isExpired()) {
      this.cache.delete(key);
      return null;
    }
    this.hookManager.runHooks(HOOK_TYPES.POST_GET, key, entry.value);
    return entry.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  _scheduleEviction(key, ttl) {
    setTimeout(() => {
      this.hookManager.runHooks(HOOK_TYPES.EVICTION, key);
      this.cache.delete(key);
    }, ttl);
  }
}
