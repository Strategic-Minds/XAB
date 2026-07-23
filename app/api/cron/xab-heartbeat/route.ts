import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 55

const HB_VERSION = '3.0.0'

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

function supabase() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}

async function checkBrowserWorker(): Promise<{ok:boolean;status:string;version?:string;latency_ms:number}> {
  const url = process.env.BROWSER_WORKER_URL
  const secret = process.env.BROWSER_WORKER_SECRET
  if (!url || !secret) return {ok:false, status:'NOT_CONFIGURED', latency_ms:0}
  const t = Date.now()
  try {
    const res = await fetch(`${url}/api/health`, {
      headers: {Authorization:`Bearer ${secret}`},
      signal: AbortSignal.timeout(8000)
    })
    const d = await res.json() as {ok?:boolean;status?:string;worker_version?:string}
    return {ok:res.ok&&d.ok!==false, status:d.status??'online', version:d.worker_version, latency_ms:Date.now()-t}
  } catch(e) {
    return {ok:false, status:`ERROR:${e instanceof Error?e.message:String(e)}`, latency_ms:Date.now()-t}
  }
}

async function recoverStaleJobs(db: ReturnType<typeof supabase>): Promise<{recovered:number}> {
  try {
    const { data } = await db
      .from('xai_job_queue')
      .update({state:'pending', lock_owner:null, lease_expires_at:null, updated_at:new Date().toISOString()})
      .eq('state','claimed')
      .lt('lease_expires_at', new Date().toISOString())
      .select('job_id')
    return {recovered: data?.length ?? 0}
  } catch { return {recovered:0} }
}

async function detectCostAnomalies(db: ReturnType<typeof supabase>): Promise<{anomaly:boolean;daily_usd:number}> {
  try {
    const since = new Date(Date.now() - 86400000).toISOString()
    const { data } = await db
      .from('xai_cost_log')
      .select('actual_usd')
      .gte('recorded_at', since)
    const total = (data??[]).reduce((s:{actual_usd:number|null}[],r)=> s, []).length > 0
      ? (data as {actual_usd:number|null}[]).reduce((s,r)=>s+(r.actual_usd??0),0) : 0
    const DAILY_LIMIT = 50
    return {anomaly: total > DAILY_LIMIT, daily_usd: total}
  } catch { return {anomaly:false, daily_usd:0} }
}

async function writeReceipt(db: ReturnType<typeof supabase>, cycleId:string, payload:Record<string,unknown>): Promise<void> {
  try {
    await db.from('xai_receipt_log').insert({
      receipt_id: cycleId,
      receipt_type: 'heartbeat_v3',
      agent: 'XAB-HEARTBEAT-V3',
      action_summary: `Heartbeat v3 cycle ${cycleId} — score:${payload.score}/100 tier:${payload.tier}`,
      evidence_refs: [payload],
      produced_at: new Date().toISOString()
    })
  } catch { /* non-blocking */ }
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({error:'Unauthorized'},{status:401})

  const cycleId = `hb3-${Date.now()}`
  const start = Date.now()
  const checks: Record<string,unknown> = {}
  let score = 100
  const alerts: string[] = []

  const db = supabase()

  // CHECK 1: BrowserWorker
  const bw = await checkBrowserWorker()
  checks.browser_worker = bw
  if (!bw.ok) { score -= 25; alerts.push(`BrowserWorker DOWN: ${bw.status}`) }

  // CHECK 2: Supabase + queue health
  let dbOk = false
  try {
    const {error} = await db.from('xai_job_queue').select('id',{head:true,count:'exact'})
    dbOk = !error
    checks.database = {ok:dbOk, error:error?.message}
  } catch(e) {
    checks.database = {ok:false, error:String(e)}
  }
  if (!dbOk) { score -= 30; alerts.push('Database UNREACHABLE') }

  // CHECK 3: Stale job recovery
  const recovery = dbOk ? await recoverStaleJobs(db) : {recovered:0}
  checks.stale_recovery = recovery
  if (recovery.recovered > 0) alerts.push(`Recovered ${recovery.recovered} stale jobs`)

  // CHECK 4: Cost anomaly detection
  const costs = dbOk ? await detectCostAnomalies(db) : {anomaly:false,daily_usd:0}
  checks.cost_anomaly = costs
  if (costs.anomaly) { score -= 10; alerts.push(`Cost anomaly: $${costs.daily_usd.toFixed(2)}/day`) }

  // CHECK 5: Required env vars
  const required = ['CRON_SECRET','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','BROWSER_WORKER_URL','BROWSER_WORKER_SECRET','OPENAI_API_KEY']
  const missing = required.filter(k => !process.env[k])
  checks.env_vars = {required:required.length, missing, ok:missing.length===0}
  if (missing.length > 0) { score -= missing.length*5; alerts.push(`Missing env: ${missing.join(', ')}`) }

  const tier = score>=95?'ELITE':score>=80?'PRODUCTION_READY':score>=60?'DEGRADED':'CRITICAL'

  const receipt = {
    cycle_id: cycleId,
    version: HB_VERSION,
    timestamp: new Date().toISOString(),
    duration_ms: Date.now()-start,
    score,
    tier,
    checks,
    alerts,
    alert_fired: alerts.length > 0
  }

  if (dbOk) writeReceipt(db, cycleId, receipt as Record<string,unknown>)

  return NextResponse.json({success:true, ...receipt})
}

export async function POST(req: NextRequest) { return GET(req) }