import EventEmitter from 'node:events';
import { CACHE_EVENTS } from '../constants/cacheEvents.js';
import { CacheManager } from './cacheManager.js';

export class EventDrivenCache extends CacheManager {
  constructor(config) {
    super(config);
    this.eventEmitter = new EventEmitter();
  }

  on(event, listener) {
    this.eventEmitter.on(event, listener);
  }

  emit(event, ...args) {
    this.eventEmitter.emit(event, ...args);
  }

  set(key, value, ttl = 60000) {
    super.set(key, value, ttl);
    this.emit(CACHE_EVENTS.UPDATE, key, value);
  }

  get(key) {
    const value = super.get(key);
    if (value !== null) {
      this.emit(CACHE_EVENTS.FETCH, key, value);
    }
    return value;
  }

  delete(key) {
    super.delete(key);
    this.emit(CACHE_EVENTS.INVALIDATE, key);
  }

  _scheduleEviction(key, ttl) {
    super._scheduleEviction(key, ttl);
    this.emit(CACHE_EVENTS.EVICTION_SCHEDULED, key, ttl);
  }
}
