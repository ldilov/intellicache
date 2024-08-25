import { CacheEntry } from '../../core/cacheEntry.js';
import { Mutex } from 'async-mutex';

export class L1MemoryCache {
	#mutex;

	constructor() {
		this.cache = new Map();
		this.code = 'L1';
		this.#mutex = new Mutex();
	}

	async get(key) {
		const release = await this.#mutex.acquire();
		try {
			const entry = this.cache.get(key);
			if (!entry || entry.isExpired()) {
				this.cache.delete(key);
				return null;
			}
			return entry.value;
		} finally {
			release();
		}
	}

	async set(key, value, ttl = 60000) {
		const release = await this.#mutex.acquire();
		try {
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
