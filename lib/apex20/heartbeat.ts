/**
 * APEX-20 5-Minute Validator Heartbeat
 * Distributed lock → health checks → score → repair packets → release lock.
 * Idempotent: safe to call multiple times per cycle.
 */
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOCK_KEY = 'apex20-heartbeat-lock';
const LOCK_TTL_MS = 4.5 * 60 * 1000; // 4.5 min — expires before next 5-min cycle

export interface HealthResult {
  component: string;
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  detail?: string;
}

export interface HeartbeatScore {
  overall: number;
  functional: number;
  agent: number;
  pubsub: number;
  ui: number;
  security: number;
  reliability: number;
  pwa: number;
  all_hard_gates_passed: boolean;
  cycle_id: string;
}

/** Acquire a distributed lock to prevent duplicate runs. */
export async function acquireLock(): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS).toISOString();

  const { data } = await db
    .from('apex20_work_packets')
    .select('id, claimed_at')
    .eq('idempotency_key', LOCK_KEY)
    .single();

  if (data) {
    // Check if expired
    const claimedAt = new Date(data.claimed_at ?? 0).getTime();
    if (Date.now() - claimedAt < LOCK_TTL_MS) return false; // Still held

    // Expired — take over
    await db.from('apex20_work_packets').update({
      claimed_at: now.toISOString(), status: 'claimed',
    }).eq('id', data.id);
    return true;
  }

  // Create new lock
  const { error } = await db.from('apex20_work_packets').insert({
    packet_type: 'HEARTBEAT_LOCK',
    payload: { expires_at: expiresAt },
    status: 'claimed',
    assigned_agent: 'A14',
    claimed_at: now.toISOString(),
    idempotency_key: LOCK_KEY,
  });

  return !error;
}

/** Release the distributed lock. */
export async function releaseLock(): Promise<void> {
  await db.from('apex20_work_packets').update({ status: 'complete', completed_at: new Date().toISOString() })
    .eq('idempotency_key', LOCK_KEY);
}

/** Run all component health checks. */
export async function runHealthChecks(): Promise<HealthResult[]> {
  const results: HealthResult[] = [];

  // Supabase DB health
  try {
    const t0 = Date.now();
    const { error } = await db.from('apex20_agents').select('id').limit(1);
    results.push({ component: 'supabase_db', status: error ? 'down' : 'ok', latency_ms: Date.now() - t0 });
  } catch {
    results.push({ component: 'supabase_db', status: 'down' });
  }

  // Agent registry health
  try {
    const { data } = await db.from('apex20_agents').select('agent_id, status').eq('status', 'active');
    const count = data?.length ?? 0;
    results.push({ component: 'agent_registry', status: count === 20 ? 'ok' : 'degraded', detail: `${count}/20 agents active` });
  } catch {
    results.push({ component: 'agent_registry', status: 'down' });
  }

  // Work queue health
  try {
    const { data } = await db.from('apex20_work_packets').select('status').neq('idempotency_key', LOCK_KEY);
    const queued = data?.filter((d: { status: string }) => d.status === 'queued').length ?? 0;
    const quarantined = data?.filter((d: { status: string }) => d.status === 'quarantined').length ?? 0;
    results.push({ component: 'work_queue', status: quarantined > 5 ? 'degraded' : 'ok', detail: `${queued} queued, ${quarantined} quarantined` });
  } catch {
    results.push({ component: 'work_queue', status: 'down' });
  }

  // Security findings check
  try {
    const { data } = await db.from('apex20_security_findings').select('severity').eq('status', 'open');
    const criticals = data?.filter((d: { severity: string }) => d.severity === 'critical').length ?? 0;
    results.push({ component: 'security', status: criticals > 0 ? 'down' : 'ok', detail: `${criticals} open criticals` });
  } catch {
    results.push({ component: 'security', status: 'degraded' });
  }

  return results;
}

/** Score the current runtime across all dimensions. */
export async function scoreRuntime(health: HealthResult[]): Promise<HeartbeatScore> {
  const cycleId = `apex20-hb-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const dbOk = health.find((h) => h.component === 'supabase_db')?.status === 'ok';
  const agentsOk = health.find((h) => h.component === 'agent_registry')?.status === 'ok';
  const securityOk = health.find((h) => h.component === 'security')?.status === 'ok';

  // Scores based on verified live state
  const score: HeartbeatScore = {
    cycle_id: cycleId,
    functional: dbOk ? 70 : 30,
    agent: agentsOk ? 90 : 40,
    pubsub: dbOk ? 60 : 20,      // Tables exist, Realtime not yet configured
    ui: 50,                        // Shell specified, not yet deployed
    security: securityOk ? 85 : 40,
    reliability: dbOk ? 75 : 30,
    pwa: 30,                       // Not yet deployed
    all_hard_gates_passed: false,   // Requires full validation run
    overall: 0,
  };
  score.overall = Math.round(
    (score.functional * 0.2 + score.agent * 0.15 + score.pubsub * 0.15 +
     score.ui * 0.15 + score.security * 0.2 + score.reliability * 0.1 + score.pwa * 0.05)
  );

  // Persist to score history
  await db.from('apex20_score_history').insert({
    cycle_id: cycleId,
    overall_score: score.overall,
    functional_score: score.functional,
    agent_score: score.agent,
    pubsub_score: score.pubsub,
    ui_score: score.ui,
    security_score: score.security,
    reliability_score: score.reliability,
    pwa_score: score.pwa,
    all_hard_gates_passed: score.all_hard_gates_passed,
    status: score.overall >= 95 ? 'AT_CEILING' : 'BELOW_CEILING',
  });

  return score;
}

/** Generate repair work packets for failing components. */
export async function generateRepairPackets(health: HealthResult[]): Promise<number> {
  const failing = health.filter((h) => h.status !== 'ok');
  if (failing.length === 0) return 0;

  const packets = failing.map((h) => ({
    packet_type: 'REPAIR',
    payload: { component: h.component, status: h.status, detail: h.detail },
    status: 'queued',
    assigned_agent: 'A20',
    idempotency_key: `repair-${h.component}-${new Date().toISOString().slice(0, 16)}`,
    metadata: { auto_generated: true, cycle: new Date().toISOString() },
  }));

  const { error } = await db.from('apex20_work_packets').insert(packets);
  return error ? 0 : packets.length;
}
