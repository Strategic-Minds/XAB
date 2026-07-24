import { NextResponse } from 'next/server'
import { runHealthChecks, type HealthCheck } from '@/lib/observability/health-checks'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkDatabase(): Promise<HealthCheck> {
  const t = Date.now()
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return {
      name: 'database',
      status: 'unhealthy',
      latency_ms: 0,
      message: 'Supabase is not configured',
    }
  }

  try {
    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await supabase.from('xai_receipt_log').select('id').limit(1)
    return {
      name: 'database',
      status: error ? 'unhealthy' : 'healthy',
      latency_ms: Date.now() - t,
      message: error?.message,
      metadata: error ? undefined : { table: 'xai_receipt_log' },
    }
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      latency_ms: Date.now() - t,
      message: error instanceof Error ? error.message : 'Database health check failed',
    }
  }
}

async function checkBrowserWorker(): Promise<HealthCheck> {
  const t = Date.now()
  const url = process.env.BROWSER_WORKER_URL ?? process.env.BROWSERWORKER_URL ?? process.env.BROWSERWORKER_BASE_URL
  const secret = process.env.BROWSER_WORKER_SECRET ?? process.env.BROWSERWORKER_SECRET ?? process.env.BROWSER_WORKER_API_KEY

  if (!url || !secret) {
    return {
      name: 'browser_worker',
      status: 'degraded',
      latency_ms: 0,
      message: 'BrowserWorker is not configured',
    }
  }

  const baseUrl = url.replace(/\/$/, '')
  let lastStatus = 0

  for (const endpoint of ['/api/health', '/health']) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${secret}`,
          'X-API-Key': secret,
        },
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      })
      lastStatus = response.status
      if (response.ok) {
        return {
          name: 'browser_worker',
          status: 'healthy',
          latency_ms: Date.now() - t,
        }
      }
    } catch {
      // Try the alternate health endpoint before returning unhealthy.
    }
  }

  return {
    name: 'browser_worker',
    status: 'unhealthy',
    latency_ms: Date.now() - t,
    message: lastStatus ? `HTTP ${lastStatus}` : 'BrowserWorker health check failed',
  }
}

async function checkMemory(): Promise<HealthCheck> {
  const memory = process.memoryUsage()
  const heapPct = memory.heapTotal > 0 ? (memory.heapUsed / memory.heapTotal) * 100 : 0

  return {
    name: 'memory',
    status: heapPct > 97 ? 'unhealthy' : heapPct > 92 ? 'degraded' : 'healthy',
    latency_ms: 0,
    metadata: {
      heap_used_mb: Math.round(memory.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
      heap_pct: Math.round(heapPct),
    },
  }
}

export async function GET() {
  const health = await runHealthChecks([checkDatabase, checkBrowserWorker, checkMemory])
  const status = health.status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, {
    status,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}
