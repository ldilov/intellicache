import { it, describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import { CacheManager } from '../src/core/cacheManager.js';
import { HOOK_TYPES } from '../src/constants/hookTypes.js';

describe('CacheManager', () => {
    let cacheManager;

    beforeEach(() => {
        cacheManager = new CacheManager();
    });

    it('should set and get a value correctly', () => {
        cacheManager.set('key1', 'value1', 5000);
        const value = cacheManager.get('key1');
        expect(value).to.equal('value1');
    });

    it('should return null for a non-existent key', () => {
        const value = cacheManager.get('nonExistentKey');
        expect(value).to.be.null;
    });

    it('should delete a key correctly', () => {
        cacheManager.set('key1', 'value1', 5000);
        cacheManager.delete('key1');
        const value = cacheManager.get('key1');
        expect(value).to.be.null;
    });

    it('should evict a key after TTL expires', (done) => {
        cacheManager.set('key1', 'value1', 50);
        setTimeout(() => {
            const value = cacheManager.get('key1');
            expect(value).to.be.null;
            done();
        }, 60); // Wait 60ms to ensure the TTL has expired
    });

    it('should run hooks during set, get, and eviction', (done) => {
        let preSetHookCalled = false;
        let postGetHookCalled = false;
        let evictionHookCalled = false;

        cacheManager.addHook(HOOK_TYPES.PRE_SET, (key, value, ttl) => {
            preSetHookCalled = true;
            expect(key).to.equal('key1');
            expect(value).to.equal('value1');
            expect(ttl).to.equal(50);
        });

        cacheManager.addHook(HOOK_TYPES.POST_GET, (key, value) => {
            postGetHookCalled = true;
            expect(key).to.equal('key1');
            expect(value).to.equal('value1');
        });

        cacheManager.addHook(HOOK_TYPES.EVICTION, (key) => {
            evictionHookCalled = true;
            expect(key).to.equal('key1');
            expect(preSetHookCalled).to.be.true;
            expect(postGetHookCalled).to.be.true;
            done();
        });

        cacheManager.set('key1', 'value1', 50);
        const value = cacheManager.get('key1');
        expect(value).to.equal('value1');

        setTimeout(() => {
            expect(evictionHookCalled).to.be.true;
        }, 60);
    });
});
