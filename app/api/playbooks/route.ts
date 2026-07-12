/**
 * XAB Playbooks API
 * List all playbooks and their current status
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: playbooks, error } = await supabase
      .from('playbooks')
      .select('playbook_id, name, slug, category, trigger_type, owner_agent, is_active, last_run_at, last_run_status, run_count, success_count, estimated_duration_seconds')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: recentRuns } = await supabase
      .from('playbook_runs')
      .select('playbook_id, run_id, status, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      playbooks: playbooks ?? [],
      recent_runs: recentRuns ?? [],
      total: playbooks?.length ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { playbook_id, trigger_payload } = await req.json();
    if (!playbook_id) return NextResponse.json({ error: 'playbook_id required' }, { status: 400 });

    const supabase = await createClient();
    const run_id = `PB-RUN-${Date.now()}`;

    await supabase.from('playbook_runs').insert({
      run_id,
      playbook_id,
      triggered_by: 'API',
      trigger_type: 'MANUAL',
      trigger_payload: trigger_payload ?? {},
      status: 'RUNNING',
    });

    return NextResponse.json({ run_id, status: 'STARTED' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}