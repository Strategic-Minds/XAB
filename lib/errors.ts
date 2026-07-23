/**
 * XAB Centralized Error Types — FAANG Grade
 * All application errors must extend XABError for typed handling
 */

export class XABError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly context?: Record<string, unknown>
  public readonly timestamp: string

  constructor(
    message: string,
    code: string,
    statusCode = 500,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'XABError'
    this.code = code
    this.statusCode = statusCode
    this.context = context
    this.timestamp = new Date().toISOString()
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AuthError extends XABError {
  constructor(message = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, context)
    this.name = 'AuthError'
  }
}

export class ValidationError extends XABError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends XABError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 'NOT_FOUND', 404, context)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends XABError {
  constructor(context?: Record<string, unknown>) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, context)
    this.name = 'RateLimitError'
  }
}

export class ServiceError extends XABError {
  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(`${service}: ${message}`, 'SERVICE_ERROR', 502, context)
    this.name = 'ServiceError'
  }
}

export class DatabaseError extends XABError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, context)
    this.name = 'DatabaseError'
  }
}

// Type guard
export function isXABError(error: unknown): error is XABError {
  return error instanceof XABError
}

// Safe error serializer — never exposes internals
export function serializeError(error: unknown): {
  code: string
  message: string
  timestamp: string
} {
  if (isXABError(error)) {
    return { code: error.code, message: error.message, timestamp: error.timestamp }
  }
  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  }
}
