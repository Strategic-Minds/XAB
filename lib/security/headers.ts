import { NextResponse } from "next/server";

/**
 * Security Headers
 * OWASP-compliant headers to protect against common attacks
 */

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy (formerly Feature-Policy)
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: wss:; " +
      "frame-ancestors 'self'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
  );

  // Strict Transport Security
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  return response;
}

/**
 * CORS headers
 */
export function addCORSHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const isAllowed = allowedOrigins.includes(origin || "");

  if (isAllowed || !origin) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

/**
 * Cache control headers
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number = 3600
): NextResponse {
  response.headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  response.headers.set(
    "ETag",
    `"${Buffer.from(JSON.stringify(response.body)).toString("base64").slice(0, 27)}"`
  );

  return response;
}

/**
 * API response headers
 */
export function addAPIHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  response.headers.set("X-API-Version", "1.0.0");
  response.headers.set("X-Powered-By", "XAB/1.0");

  return response;
}

/**
 * Apply all security headers
 */
export function applySecurityHeaders(response: NextResponse, origin?: string): NextResponse {
  let result = response;
  result = addSecurityHeaders(result);
  result = addCORSHeaders(result, origin);
  result = addAPIHeaders(result);

  return result;
}
