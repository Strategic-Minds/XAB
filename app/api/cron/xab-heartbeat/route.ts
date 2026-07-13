import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    heartbeat: 'ok',
    jobs_checked: 0,
    workflows_ticked: 0,
    agents_polled: 0,
    alerts_fired: 0,
    duration_ms: 0,
  }

  // TODO: wire to Supabase job queue
  // TODO: poll agent status
  // TODO: check workflow timeouts
  // TODO: fire alerts for SLA breaches

  results.duration_ms = Date.now() - start
  return NextResponse.json({ success: true, cron: results })
}

export async function POST(req: NextRequest) {
  return GET(req)
}