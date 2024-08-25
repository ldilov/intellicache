import { CacheEntry } from '../../core/cacheEntry.js';
import { Mutex } from 'async-mutex';
import {CACHE_LAYER_TYPES} from "../../constants/cacheLayerTypes.js";
import { LRUEvictionStrategy } from "../eviction/lruEvictionStrategy.js";

export class L1MemoryCache {
	#mutex;

	constructor(maxSize = 100) {
		this.cache = new Map();
		this.code = CACHE_LAYER_TYPES.L1;
		this.maxSize = maxSize;
		this.evictionStrategy = new LRUEvictionStrategy();
		this.#mutex = new Mutex();
	}

	async get(key) {
		const release = await this.#mutex.acquire();
		try {
			const entry = this.cache.get(key);
			if (!entry || entry.isExpired()) {
				this.cache.delete(key);
				return null;
			} else {
				this.evictionStrategy.recordAccess(key);
			}
			return entry.value;
		} finally {
			release();
		}
	}

	async set(key, value, ttl = 60000) {
		const release = await this.#mutex.acquire();
		try {
			if (this.cache.size >= this.maxSize) {
				this.evictionStrategy.evict(this.cache);
			}

			const entry = new CacheEntry(key, value, ttl);
			this.cache.set(key, entry);
		} finally {
			release();
		}
	}

	async delete(key) {
		const release = await this.#mutex.acquire();
		try {
			this.cache.delete(key);
		} finally {
			release();
		}
	}
}
