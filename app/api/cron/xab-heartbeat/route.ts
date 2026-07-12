/**
 * XAB Autonomous Machine Heartbeat
 * THE single external Vercel cron — fires every 5 minutes.
 * Dispatches all internal schedules. Never does heavy work itself.
 * 
 * Spec: Sheet 60_CRON_ORCHESTRATION, Sheet 11_FIVE_MIN_HEARTBEAT
 * Workbook: XAB_FULLY_AUTONOMOUS_APP_SYSTEM_FACTORY_MASTER_WORKBOOK_V2
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Internal schedule dispatch table (all handled here, no other Vercel crons)
const INTERNAL_SCHEDULES = [
  { name: 'queue-maintenance',     every_ticks: 1,   description: 'Recover expired leases, promote ready DAG nodes, enforce fairness' },
  { name: 'dispatch-builds',       every_ticks: 1,   description: 'Claim build jobs within concurrency and cost budgets' },
  { name: 'security-scan',         every_ticks: 72,  description: 'npm audit, secret scan, header check, RLS test (every 6h)' },
  { name: 'forensic-audit',        every_ticks: 12,  description: 'Full 20-category forensic audit (every 1h)' },
  { name: 'dlq-review',            every_ticks: 48,  description: 'Dead letter queue review and requeue (every 4h)' },
  { name: 'financial-refresh',     every_ticks: 288, description: 'XPS pricing and market intelligence refresh (daily)' },
  { name: 'source-ingest',         every_ticks: 12,  description: 'RAG ingestion queue and embedding refresh (every 1h)' },
  { name: 'sandbox-enforcement',   every_ticks: 1,   description: 'Check and destroy resource-breaching sandboxes' },
  { name: 'agent-health',          every_ticks: 1,   description: 'Verify all swarm agent heartbeats' },
  { name: 'budget-guardian',       every_ticks: 6,   description: 'Check overnight spend against $50 cap (every 30min)' },
  { name: 'quarantine-review',     every_ticks: 24,  description: 'Review pending quarantine entries (every 2h)' },
  { name: 'build-monitor',         every_ticks: 2,   description: 'Check Vercel deployment status (every 10min)' },
  { name: 'morning-brief',         every_ticks: 108, description: 'Generate morning intelligence brief (weekdays 9am EST)' },
];

export async function GET(request: Request) {
  // Step 1: Authenticate
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tick = Math.floor(Date.now() / 300_000); // 5-min bucket
  const idempotency_key = `heartbeat:${tick}`;
  const run_id = `HB-${tick}-${Date.now()}`;
  const started_at = new Date().toISOString();

  let supabase: ReturnType<typeof createClient>;
  try {
    supabase = createClient();
  } catch {
    // Supabase not configured — still return healthy
    return NextResponse.json({ status: 'ok', run_id, tick, note: 'Supabase not configured' });
  }

  // Step 2: Acquire scheduler lock (skip duplicate heartbeat)
  const { error: leaseError } = await supabase.from('workflow_leases').insert({
    lease_key: idempotency_key,
    ttl_seconds: 270, // 4.5 min — expires before next tick
    acquired_by: 'XAB-HEARTBEAT',
  }).single();

  if (leaseError) {
    // Duplicate heartbeat — skip gracefully
    return NextResponse.json({ status: 'skip', reason: 'duplicate_heartbeat', tick, idempotency_key });
  }

  const results: Record<string, unknown> = {};

  // Step 3: Recover stale leases (return expired jobs to retry queue)
  try {
    const { data: stale } = await supabase
      .from('workflow_leases')
      .select('id, lease_key')
      .lt('expires_at', new Date().toISOString())
      .neq('lease_key', idempotency_key);

    if (stale?.length) {
      await supabase.from('workflow_leases').delete().in('id', stale.map(l => l.id));
      results.stale_leases_recovered = stale.length;
    } else {
      results.stale_leases_recovered = 0;
    }
  } catch (e) { results.lease_recovery_error = String(e); }

  // Step 4: Reset timed-out CLAIMED jobs
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: timedOut } = await supabase
      .from('job_queue')
      .select('id')
      .eq('status', 'CLAIMED')
      .lt('claimed_at', tenMinutesAgo);

    if (timedOut?.length) {
      for (const job of timedOut) {
        await supabase.from('job_queue').update({
          status: 'FAILED',
          last_error: 'Claimed job timed out — returned to retry queue',
          updated_at: new Date().toISOString(),
        }).eq('id', job.id);
      }
      results.timed_out_jobs_reset = timedOut.length;
    } else {
      results.timed_out_jobs_reset = 0;
    }
  } catch (e) { results.timeout_recovery_error = String(e); }

  // Step 5: Dispatch internal schedules based on tick
  const dispatched: string[] = [];
  for (const schedule of INTERNAL_SCHEDULES) {
    if (tick % schedule.every_ticks === 0) {
      dispatched.push(schedule.name);
      // Enqueue dispatch job for each due schedule
      try {
        await supabase.from('job_queue').insert({
          job_id: `HB-DISPATCH-${schedule.name}-${tick}`,
          queue_name: 'audit',
          job_type: `SCHEDULED_${schedule.name.toUpperCase().replace(/-/g, '_')}`,
          priority: 5,
          payload: { schedule_name: schedule.name, tick, description: schedule.description },
          idempotency_key: `sched-${schedule.name}-${tick}`,
          status: 'PENDING',
        });
      } catch { /* idempotent — skip duplicate */ }
    }
  }
  results.dispatched_schedules = dispatched;

  // Step 6: Check kill switches
  try {
    const { data: armed } = await supabase
      .from('kill_switches')
      .select('switch_id, reason')
      .eq('is_active', true);
    results.armed_kill_switches = armed?.length ?? 0;
    if (armed?.length) {
      results.kill_switch_ids = armed.map(k => k.switch_id);
    }
  } catch (e) { results.kill_switch_error = String(e); }

  // Step 7: Write heartbeat receipt
  const receipt = {
    event_id: `EVT-HB-${run_id}`,
    correlation_id: `CORR-HB-${tick}`,
    idempotency_key,
    receipt_type: 'heartbeat',
    actor_agent: 'XAB-HEARTBEAT',
    target_system: 'XAB-MACHINE',
    repository_id: '1297990651',
    repository_full_name: 'Strategic-Minds/XAB',
    base44_app_id: '6a4ae522852a5e08bfa42450',
    status: 'pass',
    payload: { run_id, tick, started_at, results, dispatched_count: dispatched.length },
  };

  try {
    await supabase.from('ceiling_evidence_ledger').insert(receipt);
    results.receipt_written = true;
  } catch (e) {
    results.receipt_error = String(e);
    // Also try cron_heartbeats table as fallback
    try {
      await supabase.from('cron_heartbeats').insert({
        heartbeat_id: run_id,
        triggered_at: started_at,
        tick_number: tick,
        idempotency_key,
        status: 'COMPLETED',
        results,
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({
    status: 'ok',
    run_id,
    tick,
    started_at,
    completed_at: new Date().toISOString(),
    results,
    next_tick_at: new Date((tick + 1) * 300_000).toISOString(),
  });
}
