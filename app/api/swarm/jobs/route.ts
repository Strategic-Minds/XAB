/**
 * XAB Jobs API — enqueue and list jobs
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const queue = url.searchParams.get('queue') ?? 'all';
    const status = url.searchParams.get('status') ?? 'all';
    const limit = parseInt(url.searchParams.get('limit') ?? '50');

    const supabase = createClient();
    let query = supabase.from('job_queue').select('job_id, queue_name, job_type, status, priority, attempt_count, assigned_agent, created_at, completed_at, last_error').order('created_at', { ascending: false }).limit(limit);
    if (queue !== 'all') query = query.eq('queue_name', queue);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ jobs: data ?? [], count: data?.length ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { job_type, queue_name, payload, priority, idempotency_key } = await req.json();
    if (!job_type) return NextResponse.json({ error: 'job_type required' }, { status: 400 });

    const supabase = createClient();
    const job_id = `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { error } = await supabase.from('job_queue').insert({
      job_id,
      queue_name: queue_name ?? 'default',
      job_type,
      priority: priority ?? 5,
      payload: payload ?? {},
      idempotency_key,
      status: 'PENDING',
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ job_id, status: 'PENDING', queue: queue_name ?? 'default' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}