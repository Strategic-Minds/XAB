import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const h = req.headers.get('authorization')
  return h === `Bearer ${secret}`
}

function db() {
  return createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  try {
    const supabase = db()
    const {data, error} = await supabase
      .from('xai_job_queue')
      .select('state, priority, job_type, classification')
      .order('created_at', {ascending:false})
      .limit(100)
    if (error) return NextResponse.json({error:error.message},{status:500})
    const summary = (data??[]).reduce((acc:{[k:string]:number}, job:{state:string}) => {
      acc[job.state] = (acc[job.state]??0)+1
      return acc
    }, {})
    return NextResponse.json({ok:true, summary, jobs:data, count:(data??[]).length})
  } catch(e) {
    return NextResponse.json({error:String(e)},{status:500})
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({error:'Unauthorized'},{status:401})
  try {
    const body = await req.json() as Record<string,unknown>
    const supabase = db()
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const {data, error} = await supabase
      .from('xai_job_queue')
      .insert({
        job_id: jobId,
        job_type: body.job_type ?? 'generic',
        classification: body.classification ?? 'build',
        priority: body.priority ?? 5,
        state: 'pending',
        payload: body.payload ?? {},
        sandbox_mode: body.sandbox_mode ?? false
      })
      .select()
      .single()
    if (error) return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({ok:true, job_id:jobId, job:data})
  } catch(e) {
    return NextResponse.json({error:String(e)},{status:500})
  }
}