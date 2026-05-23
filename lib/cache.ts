/**
 * Cache utility — Redis singleton (Upstash) with in-memory LRU fallback.
 * Redis client is instantiated once per process, not per call.
 */

// ── In-memory LRU fallback ────────────────────────────────────────────────────
interface CacheEntry { value: string; expiresAt: number; lastUsed: number; }
const memoryCache = new Map<string, CacheEntry>();
const MEM_MAX = 500;

function memGet<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) { memoryCache.delete(key); return null; }
  // Update LRU timestamp
  entry.lastUsed = Date.now();
  return JSON.parse(entry.value) as T;
}

function memSet<T>(key: string, value: T, ttlSeconds: number): void {
  if (memoryCache.size >= MEM_MAX) {
    // Evict least-recently-used entry
    let lruKey = '';
    let lruTime = Infinity;
    for (const [k, v] of memoryCache) {
      if (v.lastUsed < lruTime) { lruTime = v.lastUsed; lruKey = k; }
    }
    if (lruKey) memoryCache.delete(lruKey);
  }
  memoryCache.set(key, {
    value: JSON.stringify(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
    lastUsed: Date.now(),
  });
}

// ── Redis singleton ───────────────────────────────────────────────────────────
let redisInstance: import('@upstash/redis').Redis | null | undefined = undefined;
// undefined = not yet initialized; null = unavailable

async function getRedis(): Promise<import('@upstash/redis').Redis | null> {
  if (redisInstance !== undefined) return redisInstance;
  try {
    const { Redis } = await import('@upstash/redis');
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) { redisInstance = null; return null; }
    redisInstance = new Redis({ url, token });
    return redisInstance;
  } catch {
    redisInstance = null;
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (redis) {
    try { return await redis.get<T>(key) ?? null; }
    catch { /* fall through to memory */ }
  }
  return memGet<T>(key);
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try { await redis.set(key, JSON.stringify(value), { ex: ttlSeconds }); return; }
    catch { /* fall through to memory */ }
  }
  memSet(key, value, ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = await getRedis();
  if (redis) { try { await redis.del(key); } catch { /* ignore */ } }
  memoryCache.delete(key);
}
