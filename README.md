# Intellicache

## Development Status
Intellicache is currently under active development. While the core functionality is stable, additional features and optimizations are planned for future releases. Contributions and feedback are welcome to help improve the library.

## Description

**Intellicache** is an intelligent and multi-layered caching solution designed to enhance the performance and efficiency of Node.js applications. It provides a flexible and configurable caching system that can be tailored to fit various caching strategies, including in-memory caching, file system caching, and more. The library is built with modern JavaScript features, ensuring compatibility with the latest Node.js environments.

## Features

- **Multi-Tier Caching**: Supports multiple layers of caching, allowing data to be stored in different layers such as L1 (in-memory) and L2 (file system). This hierarchical approach ensures that frequently accessed data is retrieved quickly, while less frequently used data is stored in slower but more persistent layers.

- **Highly Configurable**: Users can define the priority of cache layers, decide whether to propagate cache data across layers, and customize other behaviors through the configuration options.

- **Extensible and Modular**: Built with extensibility in mind, Intellicache allows developers to easily add new caching strategies, hooks, and other features as needed.

- **Concurrency Safe**: Utilizes the `async-mutex` library to handle concurrent access to cache layers, ensuring data consistency and thread safety.

- **Hook System**: Provides a robust hook system that allows developers to plug in custom logic for various cache events such as cache hits, cache misses, and data invalidations.

## Installation

To install Intellicache, use npm:

```bash
npm install intellicache
```

## Usage

Here’s a basic example of how to use Intellicache in a Node.js application:

```js
import { MultiTierCache } from 'intellicache';
import { CACHE_LAYER_TYPES } from 'intellicache/constants/cacheLayerTypes.js';

// Create an instance of MultiTierCache
const cache = new MultiTierCache({
    priorityList: [CACHE_LAYER_TYPES.L1, CACHE_LAYER_TYPES.L2],
    cachePropagation: true, // Enables propagation of cached data across layers
});

// Set a value in the cache
await cache.set('foo', 'bar', 5000); // Cache 'bar' under the key 'foo' with a TTL of 5000ms

// Retrieve the value
const value = await cache.get('foo');
console.log(value); // Outputs: 'bar'

// Delete the value from the cache
await cache.delete('foo');
```

## Configuration Options
* **priorityList**: Defines the order in which cache layers are accessed. For example, ```priorityList: [CACHE_LAYER_TYPES.L1, CACHE_LAYER_TYPES.L2]``` will first check the `L1` cache, then the `L2` cache if the data is not found.

* **cachePropagation**: When set to true, cached data will be propagated across all layers in the order specified in priorityList. When false, data is only cached in the first layer.

## Advantages

* **Performance**: By caching frequently accessed data in memory (L1), Intellicache significantly reduces the time required to retrieve data compared to fetching it from a database or external source.

* **Flexibility**: The multi-tier architecture allows developers to fine-tune their caching strategy based on application needs, balancing speed and persistence.

* **Concurrency Handling**: Intellicache is designed to handle concurrent access gracefully, avoiding race conditions and ensuring data integrity.

* **Easy Integration**: With a simple API and robust configuration options, Intellicache can be seamlessly integrated into new or existing Node.js applications.
