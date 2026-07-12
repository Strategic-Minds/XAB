/**
 * XAB Swarm Status API
 * Real-time view of agent pool, queue depths, sandbox count, quarantine
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    const [agents, queues, sandboxes, quarantine, dlq, score] = await Promise.all([
      supabase.from('swarm_agents').select('agent_id, agent_name, agent_type, status, current_job_count, total_jobs_run, last_active_at').order('agent_type'),
      supabase.from('queue_registry').select('queue_name, current_depth, processing_count, max_concurrency, is_active'),
      supabase.from('sandboxes').select('sandbox_id, name, status, owner_agent, actual_cost_usd').eq('status', 'ACTIVE'),
      supabase.from('quarantine').select('quarantine_id, quarantine_type, severity, review_status').eq('review_status', 'PENDING').limit(10),
      supabase.from('dead_letter_queue').select('dlq_id, queue_name, job_type, review_status').eq('review_status', 'PENDING').limit(10),
      supabase.from('score_history').select('current_verified_score, confidence_level, is_ceiling_ready, scored_at').order('scored_at', { ascending: false }).limit(1),
    ]);

    const pendingJobs = await supabase
      .from('job_queue')
      .select('queue_name, status', { count: 'exact', head: false })
      .in('status', ['PENDING', 'RUNNING', 'CLAIMED'])
      .limit(500);

    // Group by queue and status
    const queueDepths: Record<string, Record<string, number>> = {};
    for (const job of pendingJobs.data ?? []) {
      if (!queueDepths[job.queue_name]) queueDepths[job.queue_name] = {};
      queueDepths[job.queue_name][job.status] = (queueDepths[job.queue_name][job.status] ?? 0) + 1;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      score: score.data?.[0] ?? null,
      agents: {
        total: agents.data?.length ?? 0,
        by_status: agents.data?.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status as string] ?? 0) + 1 }), {} as Record<string, number>),
        list: agents.data ?? [],
      },
      queues: {
        registry: queues.data ?? [],
        live_depths: queueDepths,
      },
      sandboxes: {
        active: sandboxes.data?.length ?? 0,
        list: sandboxes.data ?? [],
      },
      quarantine: {
        pending: quarantine.data?.length ?? 0,
        list: quarantine.data ?? [],
      },
      dead_letter: {
        pending: dlq.data?.length ?? 0,
        list: dlq.data ?? [],
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}