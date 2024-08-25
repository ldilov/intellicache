import { CacheEntry } from '../../core/cacheEntry.js';
import { Mutex } from 'async-mutex';
import {CACHE_LAYER_TYPES} from "../../constants/cacheLayerTypes.js";
import { LRUEvictionStrategy } from "../eviction/lruEvictionStrategy.js";
import {ObjectPool} from "../../utils/objectPool.js";

export class L1MemoryCache {
	#mutex;

	constructor(maxSize = 100) {
		this.cache = new Map();
		this.code = CACHE_LAYER_TYPES.L1;
		this.maxSize = maxSize;
		this.evictionStrategy = new LRUEvictionStrategy();
		this.cacheEntryPool = new ObjectPool(() => new CacheEntry('', '', 0), maxSize);
		this.#mutex = new Mutex();
	}

	async get(key) {
		const entry = this.cache.get(key);
		if (!entry || entry.isExpired()) {
			const release = await this.#mutex.acquire();
			try {
				this.cache.delete(key);
				if (entry) {
					this.cacheEntryPool.release(entry);
				}
				return null;
			} finally {
				release();
			}
		}
		this.evictionStrategy.recordAccess(key);
		return entry.value;
	}

	async set(key, value, ttl = 60000) {
		const release = await this.#mutex.acquire();
		try {
			if (this.cache.size >= this.maxSize) {
				this.evictionStrategy.evict(this.cache);
			}

			let entry = this.cacheEntryPool.acquire();
			entry.key = key;
			entry.value = value;
			entry.ttl = ttl;

			this.cache.set(key, entry);
		} finally {
			release();
		}
	}

	async delete(key) {
		const release = await this.#mutex.acquire();
		try {
			const entry = this.cache.get(key);
			this.cache.delete(key);
			if (entry) {
				this.cacheEntryPool.release(entry);
			}
		} finally {
			release();
		}
	}
}
