import { NextRequest } from "next/server";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in ms
  retryAfterSeconds: number;
}

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window cache
const ipRateMap = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, record] of ipRateMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    if (record.timestamps.length === 0) {
      ipRateMap.delete(key);
    }
  }
}

/**
 * Extracts client IP from request headers (Cloudflare, Reverse Proxy, or standard remote address).
 */
export function getClientIp(req: NextRequest | Request): string {
  // 1. Cloudflare header
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // 2. Standard X-Forwarded-For header (comma-separated list: client, proxy1, proxy2)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  // 3. X-Real-IP header
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 4. Fallback default
  return "127.0.0.1";
}

/**
 * Checks sliding window rate limit for a given key (IP + endpoint).
 *
 * @param key Unique identifier (e.g. `fetch:${clientIp}`)
 * @param maxRequests Maximum requests allowed within the window
 * @param windowMs Time window in milliseconds (default 60,000ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(windowMs);

  let record = ipRateMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    ipRateMap.set(key, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetTime = oldest + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - now) / 1000));

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime,
      retryAfterSeconds,
    };
  }

  // Record this request
  record.timestamps.push(now);

  const oldest = record.timestamps[0];
  const resetTime = oldest + windowMs;
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetTime,
    retryAfterSeconds: 0,
  };
}
