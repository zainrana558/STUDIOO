/**
 * Cache utility — uses Upstash Redis when available, falls back to in-memory LRU.
 */

// Simple in-memory fallback (per-process, resets on cold start)
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

async function getRedis() {
  try {
    const { Redis } = await import('@upstash/redis');
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  // Try Redis first
  const redis = await getRedis();
  if (redis) {
    try {
      const val = await redis.get<T>(key);
      return val ?? null;
    } catch {
      // fall through to memory
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return JSON.parse(entry.value) as T;
  }
  memoryCache.delete(key);
  return null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
      return;
    } catch {
      // fall through to memory
    }
  }

  // Memory fallback — cap at 500 entries to avoid unbounded growth
  if (memoryCache.size >= 500) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, {
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try { await redis.del(key); } catch { /* ignore */ }
  }
  memoryCache.delete(key);
}
