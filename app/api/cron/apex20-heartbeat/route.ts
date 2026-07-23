/**
 * APEX-20 Heartbeat Cron — /api/cron/apex20-heartbeat
 * Runs every 5 minutes via Vercel Cron.
 * CRON_SECRET required. Durable, idempotent, observable.
 */
import { NextRequest, NextResponse } from 'next/server';
import { acquireLock, releaseLock, runHealthChecks, scoreRuntime, generateRepairPackets } from '@/lib/apex20/heartbeat';

export const maxDuration = 25; // Vercel Hobby: 25s max

export async function GET(req: NextRequest) {
  // Auth guard
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cycleStart = Date.now();
  const cycleId = `apex20-hb-${new Date().toISOString().slice(0, 16)}`;

  // Step 1: Acquire lock
  const locked = await acquireLock();
  if (!locked) {
    return NextResponse.json({ skipped: true, reason: 'another_run_active', cycle_id: cycleId });
  }

  try {
    // Step 2: Health checks
    const health = await runHealthChecks();

    // Step 3: Score runtime
    const score = await scoreRuntime(health);

    // Step 4: Generate repair packets for failing components
    const repairsQueued = await generateRepairPackets(health);

    const duration = Date.now() - cycleStart;

    return NextResponse.json({
      receipt_id: `APEX20-HB-${cycleId}`,
      cycle_id: cycleId,
      duration_ms: duration,
      health_checks: health.length,
      components_ok: health.filter((h) => h.status === 'ok').length,
      components_degraded: health.filter((h) => h.status === 'degraded').length,
      components_down: health.filter((h) => h.status === 'down').length,
      score: score.overall,
      all_gates_passed: score.all_hard_gates_passed,
      repairs_queued: repairsQueued,
      alert: score.overall >= 95 ? 'AT_CEILING_ALERT' : null,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await releaseLock();
  }
}
