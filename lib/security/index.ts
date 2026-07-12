/**
 * Security Module Export
 * Re-exports all security utilities
 */

export * from "./validation";
export * from "./rate-limit";
export * from "./error-handler";
export * from "./audit-logger";
export * from "./headers";

// Export type-safe wrapper factory
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorToResponse } from "./error-handler";

/**
 * Minimal secure route wrapper
 * Usage: export const GET = secureRoute(handler);
 */
export async function secureRoute(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<(req: NextRequest) => Promise<NextResponse>> {
  return async (req: NextRequest) => {
    try {
      // Check auth
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Call handler
      const response = await handler(req, user.id);

      // Add security headers
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "SAMEORIGIN");

      return response;
    } catch (error) {
      return errorToResponse(error);
    }
  };
}
