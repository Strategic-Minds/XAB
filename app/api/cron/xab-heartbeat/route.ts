import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 55

const HEARTBEAT_VERSION = '2.0.0'

function authGuard(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return auth === `Bearer ${secret}`
}

async function checkBrowserWorker(): Promise<{ ok: boolean; status: string; version?: string; latency_ms: number }> {
  const url = process.env.BROWSER_WORKER_URL
  const secret = process.env.BROWSER_WORKER_SECRET
  if (!url || !secret) return { ok: false, status: 'NOT_CONFIGURED', latency_ms: 0 }
  const t = Date.now()
  try {
    const res = await fetch(`${url}/api/health`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return {
      ok: res.ok && data.ok !== false,
      status: data.status ?? (res.ok ? 'online' : 'error'),
      version: data.worker_version,
      latency_ms: Date.now() - t,
    }
  } catch (e: unknown) {
    return { ok: false, status: `ERROR: ${e instanceof Error ? e.message : String(e)}`, latency_ms: Date.now() - t }
  }
}

async function checkSupabase(supabase: ReturnType<typeof createClient>): Promise<{ ok: boolean; tables: number; rls: boolean }> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name', { count: 'exact', head: true })
      .eq('table_schema', 'public')
    if (error) throw error
    return { ok: true, tables: (data as unknown as { count: number })?.count ?? 0, rls: true }
  } catch {
    // Fallback: just ping a known table
    try {
      const { error: e2 } = await supabase.from('receipt_registry').select('id').limit(1)
      return { ok: !e2, tables: -1, rls: true }
    } catch {
      return { ok: false, tables: 0, rls: false }
    }
  }
}

async function writeReceipt(
  supabase: ReturnType<typeof createClient>,
  cycleId: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('receipt_registry').insert({
      receipt_id: cycleId,
      receipt_type: 'heartbeat_cycle',
      related_system: 'XAB',
      action_summary: `Heartbeat cycle ${cycleId} — score: ${payload.score}/100`,
      produced_by_agent: 'XAB-HEARTBEAT-V2',
      produced_at: new Date().toISOString(),
      location_url: 'https://xab-system.vercel.app/api/cron/xab-heartbeat',
    })
  } catch { /* non-blocking */ }
}

export async function GET(req: NextRequest) {
  if (!authGuard(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cycleId = `hb-${Date.now()}`
  const start = Date.now()
  const checks: Record<string, unknown> = {}
  let score = 100
  const alerts: string[] = []

  // Initialize Supabase
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  // CHECK 1: BrowserWorker
  const bw = await checkBrowserWorker()
  checks.browser_worker = bw
  if (!bw.ok) {
    score -= 25
    alerts.push(`BrowserWorker DOWN: ${bw.status}`)
  }

  // CHECK 2: Supabase
  const db = await checkSupabase(supabase)
  checks.supabase = db
  if (!db.ok) {
    score -= 30
    alerts.push('Supabase UNREACHABLE')
  } else if (db.tables > 0 && db.tables < 100) {
    score -= 15
    alerts.push(`Supabase table count LOW: ${db.tables} (expected 162)`)
  }

  // CHECK 3: Required env vars
  const requiredEnvs = [
    'CRON_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'BROWSER_WORKER_URL', 'BROWSER_WORKER_SECRET', 'OPENAI_API_KEY'
  ]
  const missingEnvs = requiredEnvs.filter(k => !process.env[k])
  checks.env_vars = { required: requiredEnvs.length, missing: missingEnvs, ok: missingEnvs.length === 0 }
  if (missingEnvs.length > 0) {
    score -= missingEnvs.length * 5
    alerts.push(`Missing env vars: ${missingEnvs.join(', ')}`)
  }

  // CHECK 4: Determine tier
  const tier = score >= 95 ? 'ELITE' : score >= 80 ? 'PRODUCTION_READY' : score >= 60 ? 'DEGRADED' : 'CRITICAL'
  checks.score = score
  checks.tier = tier

  const receipt = {
    cycle_id: cycleId,
    version: HEARTBEAT_VERSION,
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - start,
    score,
    tier,
    checks,
    alerts,
    alert_fired: alerts.length > 0,
  }

  // Write receipt to Supabase (non-blocking)
  if (db.ok) {
    writeReceipt(supabase, cycleId, receipt as Record<string, unknown>)
  }

  return NextResponse.json({ success: true, ...receipt })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
