import NodeCache from 'node-cache';

// In-memory cache (for development)
// In production, use Redis for distributed caching
const cache = new NodeCache({
  stdTTL: 300, // Default TTL: 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Better performance
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export const cacheService = {
  // Get value from cache
  get: <T>(key: string): T | undefined => {
    return cache.get<T>(key);
  },

  // Set value in cache
  set: <T>(key: string, value: T, options?: CacheOptions): boolean => {
    const ttl = options?.ttl || 300; // Default 5 minutes
    return cache.set(key, value, ttl);
  },

  // Delete value from cache
  del: (key: string): number => {
    return cache.del(key);
  },

  // Clear all cache
  flush: (): void => {
    cache.flushAll();
  },

  // Check if key exists
  has: (key: string): boolean => {
    return cache.has(key);
  },

  // Get cache statistics
  getStats: () => {
    return cache.getStats();
  },
};

// Cache key generators
export const cacheKeys = {
  users: {
    all: 'users:all',
    byId: (id: string) => `users:${id}`,
  },
  posts: {
    all: 'posts:all',
    byId: (id: string) => `posts:${id}`,
    byAuthor: (authorId: string) => `posts:author:${authorId}`,
  },
  events: {
    all: 'events:all',
    byId: (id: string) => `events:${id}`,
    upcoming: 'events:upcoming',
  },
};
