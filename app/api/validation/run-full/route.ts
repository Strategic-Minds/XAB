import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://xab-system.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || 'xab-cron-secret-2024';

async function sb(table: string, method = 'GET', body?: unknown, params = '') {
  if (!SUPABASE_URL) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    method, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function getScheduleMode(): string {
  const hour = new Date().getUTCHours();
  const nyHour = (hour - 4 + 24) % 24; // ET
  if (nyHour >= 3 && nyHour < 6) return 'minimal';     // 3am-6am: scale back
  if (nyHour >= 6 && nyHour < 18) return 'api_only';   // 6am-6pm: API checks only
  return 'full';                                         // 6pm-3am: full overnight mode
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.includes(CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mode = getScheduleMode();
  const overrideMode = req.headers.get('x-validation-mode');
  const finalMode = overrideMode || mode;

  // Call the validation agent
  const agentRes = await fetch(`${BASE_URL}/api/validation/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-validation-mode': finalMode },
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(55000),
  }).catch(e => null);

  if (!agentRes) {
    await sb('validation_runs', 'POST', { run_id: `vr-fail-${Date.now()}`, mode: finalMode, status: 'error', error: 'Agent unreachable', started_at: new Date().toISOString() });
    return NextResponse.json({ error: 'Validation agent unreachable' }, { status: 503 });
  }

  const result = await agentRes.json();

  // If score drops below threshold, queue auto-repair
  if (result.score < 80 && result.failed > 0) {
    await sb('jobs', 'POST', {
      job_type: 'auto_repair',
      payload: { trigger: 'validation_failure', run_id: result.run_id, failed_count: result.failed, score: result.score },
      priority: 9,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ mode: finalMode, ...result, schedule_mode: mode });
}

export async function GET() {
  const mode = getScheduleMode();
  return NextResponse.json({ schedule_mode: mode, agent: '/api/validation/agent', full_runner: '/api/validation/run-full' });
}
