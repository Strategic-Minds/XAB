import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standardized Error Handling
 * Sanitized, consistent error responses
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string>) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(403, message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Convert errors to safe response objects
 */
export function errorToResponse(error: unknown): NextResponse {
  console.error("[Error]", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    error.issues.forEach((err) => {
  // @ts-expect-error -- type safety suppressed for compatibility
      const path = (err as any).path?.join(".") || "unknown";
      fieldErrors[path] = err.message;
    });

    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: fieldErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "production" ? "Internal server error" : error.message;

    return NextResponse.json(
      {
        error: message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: "Unknown error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

/**
 * Wrap async handler with error catching
 */
export function withErrorHandling(
  handler: (
    request: any
  ) => Promise<NextResponse> | NextResponse
): (request: any) => Promise<NextResponse> {
  return async (request: any) => {
    try {
      return await handler(request);
    } catch (error) {
      return errorToResponse(error);
    }
  };
}

/**
 * Check if error is safe to expose
 */
export function isSafeError(error: unknown): boolean {
  if (error instanceof ValidationError) return true;
  if (error instanceof NotFoundError) return true;
  if (error instanceof UnauthorizedError) return true;
  if (error instanceof ForbiddenError) return true;
  if (error instanceof ConflictError) return true;
  return false;
}

/**
 * Get safe error message
 */
export function getSafeErrorMessage(error: unknown): string {
  if (isSafeError(error) && error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}
