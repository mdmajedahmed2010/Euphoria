import { unstable_cache } from "next/cache";
import { Redis } from "@upstash/redis";

// Instantiate real Redis if configured, otherwise fall back to mock
let redisClient: {
  get: (key: string) => Promise<string | null>;
  set: (
    key: string,
    value: string,
    options?: { px?: number; nx?: boolean; ex?: number }
  ) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  incr: (key: string) => Promise<number>;
};

// In-memory local fallback store
const memoryStore = new Map<string, { value: string; expiresAt: number }>();
const memoryRedis = {
  get: async (key: string) => {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  },
  set: async (
    key: string,
    value: string,
    options?: { px?: number; nx?: boolean; ex?: number }
  ) => {
    const now = Date.now();
    const entry = memoryStore.get(key);
    if (options?.nx && entry && now <= entry.expiresAt) {
      return null;
    }
    let durationMs = 30000;
    if (options?.px) durationMs = options.px;
    else if (options?.ex) durationMs = options.ex * 1000;

    memoryStore.set(key, { value, expiresAt: now + durationMs });
    return "OK";
  },
  del: async (key: string) => {
    return memoryStore.delete(key) ? 1 : 0;
  },
  incr: async (key: string) => {
    const now = Date.now();
    const entry = memoryStore.get(key);
    let val = 1;
    if (entry && now <= entry.expiresAt) {
      val = parseInt(entry.value) + 1;
    }
    memoryStore.set(key, { value: val.toString(), expiresAt: now + 31536000000 });
    return val;
  },
};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const upstashClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const withTimeout = <T>(promise: Promise<T>, ms = 800): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Redis network timeout")), ms)
      ),
    ]);

  // Fault-tolerant wrapper: if Upstash network call fails or exceeds 800ms, fallback immediately to memory
  redisClient = {
    get: async (key: string) => {
      try {
        return (await withTimeout(upstashClient.get(key) as Promise<string | null>));
      } catch (err) {
        console.warn("[REDIS] Upstash get failed or timed out, using memory fallback:", err);
        return memoryRedis.get(key);
      }
    },
    set: async (key: string, value: string, options?: { px?: number; nx?: boolean; ex?: number }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (await withTimeout(upstashClient.set(key, value, options as any) as Promise<string | null>));
      } catch (err) {
        console.warn("[REDIS] Upstash set failed or timed out, using memory fallback:", err);
        return memoryRedis.set(key, value, options);
      }
    },
    del: async (key: string) => {
      try {
        return await withTimeout(upstashClient.del(key));
      } catch (err) {
        console.warn("[REDIS] Upstash del failed or timed out, using memory fallback:", err);
        return memoryRedis.del(key);
      }
    },
    incr: async (key: string) => {
      try {
        return await withTimeout(upstashClient.incr(key));
      } catch (err) {
        console.warn("[REDIS] Upstash incr failed or timed out, using memory fallback:", err);
        return memoryRedis.incr(key);
      }
    },
  };
} else {
  redisClient = memoryRedis;
}

export const redis = redisClient;

/**
 * Acquire distributed lock for product variants during checkout.
 * Runs lock acquisition in parallel with fast timeout.
 */
export async function acquireInventoryLocks(variantIds: string[], lockToken = "locked"): Promise<boolean> {
  const sortedIds = Array.from(new Set(variantIds)).sort();
  
  const results = await Promise.all(
    sortedIds.map(async (id) => {
      const lockKey = `lock:variant:${id}`;
      let attempts = 0;
      while (attempts < 2) {
        const res = await redis.set(lockKey, lockToken, { px: 10000, nx: true });
        if (res === "OK") return { id, success: true };
        attempts++;
        if (attempts < 2) await new Promise((resolve) => setTimeout(resolve, 15));
      }
      return { id, success: false };
    })
  );

  const acquiredLocks = results.filter((r) => r.success).map((r) => r.id);
  const allLocked = results.every((r) => r.success);

  if (!allLocked) {
    await releaseInventoryLocks(acquiredLocks, lockToken);
    return false;
  }

  return true;
}

/**
 * Release inventory locks after checkout processing completes.
 * Runs cleanup cleanly in parallel.
 */
export async function releaseInventoryLocks(variantIds: string[], lockToken = "locked"): Promise<void> {
  const sortedIds = Array.from(new Set(variantIds)).sort();
  await Promise.all(
    sortedIds.map(async (id) => {
      const lockKey = `lock:variant:${id}`;
      const currentToken = await redis.get(lockKey);
      if (!currentToken || currentToken === lockToken || lockToken === "locked") {
        await redis.del(lockKey);
      }
    })
  );
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  try {
    const cachedFn = unstable_cache(
      async () => {
        return await fetcher();
      },
      [key],
      { revalidate: ttlSeconds, tags: [key] }
    );
    return await cachedFn();
  } catch (error) {
    console.warn("[CACHE] Fallback to direct fetch due to cache error:", error);
    return await fetcher();
  }
}
