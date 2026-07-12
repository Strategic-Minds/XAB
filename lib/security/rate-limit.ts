import { NextRequest, NextResponse } from "next/server";

/**
 * Rate Limiting System
 * Prevents abuse and ensures fair usage
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default limits: 100 requests per minute per user
const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW = 60 * 1000; // 1 minute

/**
 * Get user identifier from request
 */
export function getUserIdentifier(req: NextRequest): string {
  const userId = req.headers.get("x-user-id") || "anonymous";
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  return `${userId}:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  window: number = DEFAULT_WINDOW
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    // New window
    entry = {
      count: 0,
      resetAt: now + window,
    };
  }

  const resetAt = entry.resetAt;
  const remaining = Math.max(0, limit - entry.count);
  const allowed = entry.count < limit;

  if (allowed) {
    entry.count++;
  }

  rateLimitStore.set(identifier, entry);

  return { allowed, remaining, resetAt };
}

/**
 * Rate limit middleware
 */
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { limit?: number; window?: number } = {}
): Promise<NextResponse> {
  const { limit = DEFAULT_LIMIT, window = DEFAULT_WINDOW } = options;
  const identifier = getUserIdentifier(req);
  const rateLimitResult = checkRateLimit(identifier, limit, window);

  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000
          ).toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetAt.toString(),
        },
      }
    );
  }

  const response = await handler(req);

  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toString());

  return response;
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt + 60 * 1000) {
      // Keep for 1 extra minute
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
