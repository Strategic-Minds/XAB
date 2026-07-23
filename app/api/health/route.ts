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
  } catch (e) {
    return {
      name: 'database',
      status: 'unhealthy',
      latency_ms: Date.now() - t,
      message: e instanceof Error ? e.message : 'Database health check failed',
    }
  }
}

async function checkBrowserWorker(): Promise<HealthCheck> {
  const t = Date.now()
  const url = process.env.BROWSER_WORKER_URL
  const secret = process.env.BROWSER_WORKER_SECRET

  if (!url || !secret) {
    return {
      name: 'browser_worker',
      status: 'degraded',
      latency_ms: 0,
      message: 'BrowserWorker is not configured',
    }
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/api/health`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })

    return {
      name: 'browser_worker',
      status: res.ok ? 'healthy' : 'unhealthy',
      latency_ms: Date.now() - t,
      message: res.ok ? undefined : `HTTP ${res.status}`,
    }
  } catch (e) {
    return {
      name: 'browser_worker',
      status: 'unhealthy',
      latency_ms: Date.now() - t,
      message: e instanceof Error ? e.message : 'BrowserWorker health check failed',
    }
  }
}

async function checkMemory(): Promise<HealthCheck> {
  const mem = process.memoryUsage()
  const heapPct = mem.heapTotal > 0 ? (mem.heapUsed / mem.heapTotal) * 100 : 0

  return {
    name: 'memory',
    status: heapPct > 95 ? 'unhealthy' : heapPct > 85 ? 'degraded' : 'healthy',
    latency_ms: 0,
    metadata: {
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
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
