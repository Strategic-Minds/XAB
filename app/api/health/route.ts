import { NextResponse } from 'next/server'
import { runHealthChecks, type HealthCheck } from '@/lib/observability/health-checks'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function checkDatabase(): Promise<HealthCheck> {
  const t = Date.now()
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )
    const { error } = await supabase.from('receipt_registry').select('id').limit(1)
    return {
      name: 'database',
      status: error ? 'unhealthy' : 'healthy',
      latency_ms: Date.now() - t,
      message: error?.message,
    }
  } catch (e) {
    return { name: 'database', status: 'unhealthy', latency_ms: Date.now() - t, message: String(e) }
  }
}

async function checkBrowserWorker(): Promise<HealthCheck> {
  const t = Date.now()
  const url = process.env.BROWSER_WORKER_URL
  if (!url) return { name: 'browser_worker', status: 'degraded', latency_ms: 0, message: 'Not configured' }
  try {
    const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(5000) })
    return {
      name: 'browser_worker',
      status: res.ok ? 'healthy' : 'unhealthy',
      latency_ms: Date.now() - t,
      message: res.ok ? undefined : `HTTP ${res.status}`,
    }
  } catch (e) {
    return { name: 'browser_worker', status: 'unhealthy', latency_ms: Date.now() - t, message: String(e) }
  }
}

async function checkMemory(): Promise<HealthCheck> {
  const mem = process.memoryUsage()
  const heapPct = (mem.heapUsed / mem.heapTotal) * 100
  return {
    name: 'memory',
    status: heapPct > 90 ? 'unhealthy' : heapPct > 75 ? 'degraded' : 'healthy',
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
  const status = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503
  return NextResponse.json(health, { status })
}
