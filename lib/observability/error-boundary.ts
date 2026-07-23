/**
 * Typed error boundary utilities — FAANG pattern
 * Every async route handler should use wrapHandler()
 */

import { NextRequest, NextResponse } from 'next/server'
import { captureError, logger } from './index'

type Handler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>

export function wrapHandler(handler: Handler): Handler {
  return async (req: NextRequest, ctx?: unknown): Promise<NextResponse> => {
    const start = Date.now()
    try {
      const res = await handler(req, ctx)
      logger.info(
        { method: req.method, url: req.url, status: res.status, duration_ms: Date.now() - start },
        'Request completed'
      )
      return res
    } catch (error: unknown) {
      captureError(error, { method: req.method, url: req.url })
      return NextResponse.json(
        { error: 'Internal Server Error', timestamp: new Date().toISOString() },
        { status: 500 }
      )
    }
  }
}
