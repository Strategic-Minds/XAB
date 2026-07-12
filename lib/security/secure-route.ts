import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, errorToResponse } from "./error-handler";
import { withRateLimit } from "./rate-limit";
import { applySecurityHeaders, addCacheHeaders } from "./headers";
import { logAudit, getRequestMetadata } from "./audit-logger";
import { createClient } from "@/lib/supabase/server";

/**
 * Secure Route Handler
 * Base handler with all security measures built-in
 */

export interface SecureRouteContext {
  req: NextRequest;
  userId: string;
  userEmail?: string;
  metadata: ReturnType<typeof getRequestMetadata>;
}

export type SecureRouteHandler = (
  context: SecureRouteContext
) => Promise<NextResponse>;

/**
 * Create secure route handler with all protections
 */
export function createSecureRoute(handler: SecureRouteHandler) {
  return withErrorHandling(async (req: NextRequest) => {
    // 1. Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get user metadata
    const metadata = getRequestMetadata(req);

    // 3. Rate limiting
    return withRateLimit(req, async () => {
      try {
        // 4. Call handler
        const response = await handler({
          req,
          userId: user.id,
          userEmail: user.email,
          metadata,
        });

        // 5. Apply security headers
        let secureResponse = applySecurityHeaders(response, req.headers.get("origin") || undefined);
        secureResponse = addCacheHeaders(secureResponse, 300); // 5 minute cache

        // 6. Log success
        await logAudit({
          userId: user.id,
          action: "READ",
          resource: new URL(req.url).pathname,
          status: "success",
          statusCode: response.status,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        });

        return secureResponse;
      } catch (error) {
        // 7. Log failure
        await logAudit({
          userId: user.id,
          action: "READ",
          resource: new URL(req.url).pathname,
          status: "failure",
          statusCode: 500,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        });

        return errorToResponse(error);
      }
    });
  });
}

/**
 * Create data mutation route (POST/PUT/DELETE)
 */
export function createMutationRoute(handler: SecureRouteHandler) {
  return withErrorHandling(async (req: NextRequest) => {
    // 1. Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get user metadata
    const metadata = getRequestMetadata(req);

    // 3. Rate limiting (stricter for mutations)
    return withRateLimit(
      req,
      async () => {
        try {
          // 4. Call handler
          const response = await handler({
            req,
            userId: user.id,
            userEmail: user.email,
            metadata,
          });

          // 5. Apply security headers (no caching for mutations)
          const secureResponse = applySecurityHeaders(response, req.headers.get("origin") || undefined);
          secureResponse.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

          // 6. Log success
          const method = req.method;
          const action = method === "DELETE" ? "DELETE" : method === "POST" ? "CREATE" : "UPDATE";

          await logAudit({
            userId: user.id,
            action,
            resource: new URL(req.url).pathname,
            status: "success",
            statusCode: response.status,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
          });

          return secureResponse;
        } catch (error) {
          // 7. Log failure
          const method = req.method;
          const action = method === "DELETE" ? "DELETE" : method === "POST" ? "CREATE" : "UPDATE";

          await logAudit({
            userId: user.id,
            action,
            resource: new URL(req.url).pathname,
            status: "failure",
            statusCode: 500,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
          });

          return errorToResponse(error);
        }
      },
      { limit: 50, window: 60 * 1000 } // 50 mutations per minute
    );
  });
}
