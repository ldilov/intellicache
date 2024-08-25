export class CacheEntry {
	constructor(key, value, ttl) {
		this.key = key;
		this.value = value;
		this.ttl = ttl;
		this.createdAt = Date.now();
	}

	isExpired() {
		return Date.now() > this.createdAt + this.ttl;
	}
}
