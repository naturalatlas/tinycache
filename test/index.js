var assert = require('chai').assert;
var TinyCache = require('../tinycache.js');
var i = 0, new_key = function() { return 'key_' + (++i); };

var suite = function(cache) {
	describe('size()', function() {
		it('should return 0 when empty', function() {
			cache.clear();
			assert.equal(cache.size(), 0);
		});
		it('should return size', function() {
			cache.clear();
			cache.put(new_key(), 1, 10);
			assert.equal(cache.size(), 1);
		});
		it('should return correct value after object falls out of cache', function(done) {
			var start = cache.size();
			cache.put(new_key(), 1, 2);
			assert.equal(cache.size(), start + 1);
			setTimeout(function() {
				assert.equal(cache.size(), start);
				done();
			}, 4);
		});
	});

	describe('clear()', function() {
		it('should clear all objects', function() {
			var size_start = cache.size();
			var keys = [new_key(), new_key(), new_key()];
			cache.put(keys[0], 1, 10);
			cache.put(keys[1], 2, 10);
			cache.put(keys[2], 3, 10);
			assert.equal(cache.size(), size_start + 3);

			cache.clear();
			assert.equal(cache.size(), 0);
			assert.isNull(cache.get(keys[0]));
			assert.isNull(cache.get(keys[1]));
			assert.isNull(cache.get(keys[2]));
		});
	});

	describe('get()', function() {
		it('should return null if key doesn\'t exist', function() {
			assert.isNull(cache.get('awf1n1a'));
			assert.isNull(cache.get(null));
			assert.isNull(cache.get());
			assert.isNull(cache.get(1));
			assert.isNull(cache.get(true));
			assert.isNull(cache.get(false));
		});
		it('should return value', function() {
			var complicated = ['a',{'b':'c','d':['e',3]},'@'];
			var key = new_key();
			cache.put(key, complicated, 100);
			assert.deepEqual(cache.get(key), complicated);
		});
	});

	describe('put()', function() {
		it('should overwrite existing object if exists', function(done) {
			var ttl1 = 20;
			var ttl2 = 20;
			var value1 = {a:1};
			var value2 = {a:2};
			var key = new_key();

			cache.put(key, value1, ttl1);
			assert.deepEqual(cache.get(key), value1);
			setTimeout(function() {
				cache.put(key, value2, ttl2);
				assert.deepEqual(cache.get(key), value2);
			}, 10);

			// test that the value isn't wiped out by the first
			// put()'s timeout
			setTimeout(function() {
				assert.deepEqual(cache.get(key), value2);
				done();
			}, 25);
		});
		describe('stored object', function() {
			it('should exist during ttl (ms)', function(done) {
				var ttl = 20;
				var value = {a:1};
				var key = new_key();
				cache.put(key, value, ttl);
				setTimeout(function() {
					assert.deepEqual(cache.get(key), value);
					done();
				}, 10);
			});
			it('should expire after ttl (ms)', function(done) {
				var ttl = 20;
				var value = {a:1};
				var key = new_key();
				cache.put(key, value, ttl)
				setTimeout(function() {
					assert.isNull(cache.get(key));
					done();
				}, 30);
			});
		});
	});

	describe('hits()', function() {
		it('should return number of cache hits', function() {
			var key = new_key();
			cache.put(key, 1, 1);
			var start = cache.hits();
			cache.get('missing');
			cache.get(key);
			cache.get(key);
			cache.get(key);
			assert.equal(cache.hits(), start + 3);
		});
	});

	describe('misses()', function() {
		it('should return number of cache misses', function() {
			var key = new_key();
			cache.put(key, 1, 1);
			var start = cache.misses();
			cache.get('missing');
			cache.get('missing');
			cache.get(key);
			assert.equal(cache.misses(), start + 2);
		});
	});
};

describe('tinycache (instance)', function() { suite(new TinyCache()); });
describe('tinycache (shared)', function() { suite(TinyCache.shared); });