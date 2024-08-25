import { CacheManager } from './cacheManager.js';
import { HOOK_TYPES } from '../constants/hookTypes.js';
import { L1MemoryCache } from '../strategies/layering/l1MemoryCache.js';
import { L2FileSystemCache } from '../strategies/layering/l2FileSystemCache.js';
import { CACHE_LAYER_TYPES } from '../constants/cacheLayerTypes';
import { Mutex } from 'async-mutex';

export class MultiTierCache extends CacheManager {
	#mutex;

	constructor(
		config = {
			priorityList: [CACHE_LAYER_TYPES.L1, CACHE_LAYER_TYPES.L2],
			cachePropagation: false,
		},
	) {
		super(config);
		const l1Cache = new L1MemoryCache();
		const l2Cache = new L2FileSystemCache();

		this._cacheDict = {
			[CACHE_LAYER_TYPES.L1]: l1Cache,
			[CACHE_LAYER_TYPES.L2]: l2Cache,
		};

		this._priorityList = config?.priorityList;
		this._cachePropagation = config?.cachePropagation;

		this.#mutex = new Mutex();
	}

	async get(key) {
		const release = await this.#mutex.acquire();
		try {
			let value = null;
			for (const layerKey of this._priorityList) {
				const layer = this._cacheDict[layerKey];
				value = await layer.get(key);
				if (value !== null) {
					this.hookManager.runHooks(
						HOOK_TYPES.CACHE_HIT,
						key,
						value,
						layer.code,
					);
					return value;
				}
			}

			this.hookManager.runHooks(HOOK_TYPES.CACHE_MISS, key);
			return null;
		} finally {
			release();
		}
	}

	async set(key, value, ttl = 60000) {
		const release = await this.#mutex.acquire();
		try {
			for (const layerKey of this._priorityList) {
				const layer = this._cacheDict[layerKey];
				await layer.set(key, value, ttl);
				if (!this._cachePropagation) {
					break;
				}
			}

			this.hookManager.runHooks(HOOK_TYPES.PRE_SET, key, value, ttl);
		} finally {
			release();
		}
	}

	async delete(key) {
		const release = await this.#mutex.acquire();
		try {
			for (const layerKey of this._priorityList) {
				const layer = this._cacheDict[layerKey];
				await layer.delete(key);
				if (!this._cachePropagation) {
					break;
				}
			}
		} finally {
			release();
		}
	}
}
