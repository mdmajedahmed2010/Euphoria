/**
 * Euphoria — Rate Limiting (Upstash Redis)
 * SOP §৪D — Abuse Prevention
 *
 * Uses sliding window algorithm via Upstash Redis
 * Fallback: in-memory rate limiting if Redis unavailable
 */

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // timestamp when limit resets
}

// ═══════════════════════════════════════════
// RATE LIMIT CONFIGS (SOP §৪D)
// ═══════════════════════════════════════════

export const RATE_LIMIT_CONFIGS = {
  login: { limit: 5, window: 15 * 60 }, // 5 attempts per 15 min
  register: { limit: 3, window: 60 * 60 }, // 3 attempts per hour
  passwordReset: { limit: 3, window: 60 * 60 }, // 3 per hour
  checkout: { limit: 10, window: 60 }, // 10 per minute
  api: { limit: 100, window: 60 }, // 100 per minute
  admin: { limit: 50, window: 60 }, // 50 per minute
} as const;

// ═══════════════════════════════════════════
// IN-MEMORY FALLBACK (when Redis unavailable)
// ═══════════════════════════════════════════

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + config.window * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, reset: resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetAt,
  };
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

// ═══════════════════════════════════════════
// REDIS RATE LIMITING (Upstash)
// ═══════════════════════════════════════════

async function redisRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Fallback to memory if Redis not configured
    return memoryRateLimit(key, config);
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `ratelimit:${key}:${Math.floor(now / config.window)}`;

    // Increment counter with 600ms max timeout so checkout is never delayed
    const incrResponse = await fetch(`${redisUrl}/incr/${windowKey}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      signal: AbortSignal.timeout(600),
    });
    const incrData = await incrResponse.json();
    const count = incrData.result as number;

    // Set expiry on first request in window (fire-and-forget or fast timeout)
    if (count === 1) {
      fetch(`${redisUrl}/expire/${windowKey}/${config.window}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        signal: AbortSignal.timeout(600),
      }).catch(() => {});
    }

    const remaining = Math.max(0, config.limit - count);
    const reset = (Math.floor(now / config.window) + 1) * config.window * 1000;

    if (count > config.limit) {
      return { success: false, remaining: 0, reset };
    }

    return { success: true, remaining, reset };
  } catch (error) {
    // If Upstash times out or fails, fallback immediately to in-memory protection without throwing
    return memoryRateLimit(key, config);
  }
}

// ═══════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique key (e.g., IP address, user ID, email)
 * @param type - Rate limit type from RATE_LIMIT_CONFIGS
 * @returns RateLimitResult with success status
 */
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIGS
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  const key = `${type}:${identifier}`;

  return redisRateLimit(key, config);
}

/**
 * Get client IP from headers (for rate limiting)
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown"
  );
}
