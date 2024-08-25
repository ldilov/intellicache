import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gunzip, gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { Mutex } from 'async-mutex';
import { CacheEntry } from '../../core/cacheEntry.js';
import {CACHE_LAYER_TYPES} from "../../constants/cacheLayerTypes.js";

const asyncGzip = promisify(gzip);
const asyncGunzip = promisify(gunzip);

export class L2FileSystemCache {
	#mutex;

	constructor(cacheDir = './cache', maxSize = 100) {
		this.cacheDir = cacheDir;
		this.code = CACHE_LAYER_TYPES.L2;
		this.cacheKeys = new Set();
		this.#mutex = new Mutex();
		fs.mkdir(this.cacheDir, { recursive: true }).catch(console.error);
	}

	async get(key) {
		const release = await this.#mutex.acquire();
		try {
			if (!this.cacheKeys.has(key)) {
				return null;
			}

			const filePath = this._getFilePath(key);
			const data = await fs.readFile(filePath);
			const decompressedData = await asyncGunzip(data);
			const entry = JSON.parse(decompressedData.toString());

			if (entry.ttl < Date.now()) {
				await fs.unlink(filePath);
				return null;
			}

			this.cacheKeys.add(key);

			return entry.value;
		} catch (err) {
			if (err.code !== 'ENOENT') console.error(err);
			return null;
		} finally {
			release();
		}
	}

	async set(key, value, ttl = 60000) {
		const release = await this.#mutex.acquire();
		try {
			const entry = new CacheEntry(key, value, ttl);
			const filePath = this._getFilePath(key);
			const compressedData = await asyncGzip(
				Buffer.from(JSON.stringify(entry)),
			);

			await fs.writeFile(filePath, compressedData);
		} catch (err) {
			console.error(err);
		} finally {
			release();
		}
	}

	async delete(key) {
		const release = await this.#mutex.acquire();
		try {
			const filePath = this._getFilePath(key);
			await fs.unlink(filePath);
			this.cacheKeys.delete(key);
		} catch (err) {
			if (err.code !== 'ENOENT') console.error(err);
		} finally {
			release();
		}
	}

	_getFilePath(key) {
		return path.join(this.cacheDir, key);
	}
}
