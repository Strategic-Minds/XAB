import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const XAB_VERSION = '1.0.0';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function sb(table: string, method = 'GET', body?: unknown, params = '') {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { error: 'Supabase not configured' };
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : { ok: true };
}

const TOOLS = [
  { name: 'xab_health', description: 'Check XAB system health', inputSchema: { type: 'object', properties: {} } },
  { name: 'xab_swarm_status', description: 'Get live swarm agent and queue status', inputSchema: { type: 'object', properties: {} } },
  { name: 'xab_list_missions', description: 'List active missions', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'xab_enqueue_job', description: 'Add a job to the queue', inputSchema: { type: 'object', properties: { job_type: { type: 'string' }, payload: { type: 'object' }, priority: { type: 'number' } }, required: ['job_type'] } },
  { name: 'xab_get_score', description: 'Get current XAB readiness score', inputSchema: { type: 'object', properties: {} } },
  { name: 'xab_list_findings', description: 'List audit findings', inputSchema: { type: 'object', properties: { severity: { type: 'string' } } } },
  { name: 'xab_list_playbooks', description: 'List available playbooks', inputSchema: { type: 'object', properties: {} } },
  { name: 'xab_get_validation_status', description: 'Get latest validation run results', inputSchema: { type: 'object', properties: {} } },
  { name: 'xab_list_queue', description: 'List jobs in a specific queue', inputSchema: { type: 'object', properties: { queue_name: { type: 'string' }, status: { type: 'string' } } } },
  { name: 'xab_get_ncp_leads', description: 'Get NCP flooring leads', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'xab_get_ncp_opportunities', description: 'Get NCP opportunities', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'xab_arm_kill_switch', description: 'Arm emergency kill switch (requires approval)', inputSchema: { type: 'object', properties: { switch_id: { type: 'string' }, reason: { type: 'string' } }, required: ['switch_id', 'reason'] } },
];

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'xab_health': return { version: XAB_VERSION, status: 'operational', timestamp: new Date().toISOString() };
    case 'xab_swarm_status': {
      const [jobs, agents] = await Promise.all([
        sb('jobs', 'GET', undefined, '?select=status&limit=200'),
        sb('agents', 'GET', undefined, '?select=name,status&limit=50'),
      ]);
      const byStatus: Record<string, number> = {};
      if (Array.isArray(jobs)) for (const j of jobs) byStatus[j.status] = (byStatus[j.status] || 0) + 1;
      return { job_counts: byStatus, agents: Array.isArray(agents) ? agents : [], timestamp: new Date().toISOString() };
    }
    case 'xab_list_missions': {
      const limit = (args.limit as number) || 10;
      const missions = await sb('missions', 'GET', undefined, `?select=*&limit=${limit}&order=created_at.desc`);
      return { missions: Array.isArray(missions) ? missions : [], count: Array.isArray(missions) ? missions.length : 0 };
    }
    case 'xab_enqueue_job': {
      const result = await sb('jobs', 'POST', { job_type: args.job_type, payload: args.payload || {}, priority: args.priority || 5, status: 'pending', created_at: new Date().toISOString() });
      return { queued: true, result };
    }
    case 'xab_get_score': {
      const scores = await sb('scores', 'GET', undefined, '?select=*&order=created_at.desc&limit=1');
      return Array.isArray(scores) && scores[0] ? scores[0] : { message: 'No scores yet' };
    }
    case 'xab_list_findings': {
      const params = args.severity ? `?data->>severity=eq.${args.severity}&limit=20` : '?limit=20&order=created_at.desc';
      const findings = await sb('audit_findings', 'GET', undefined, params);
      return { findings: Array.isArray(findings) ? findings : [] };
    }
    case 'xab_list_playbooks': {
      const pbs = await sb('playbooks', 'GET', undefined, '?select=name,trigger_type,status&limit=30&order=name');
      return { playbooks: Array.isArray(pbs) ? pbs : [] };
    }
    case 'xab_get_validation_status': {
      const runs = await sb('validation_runs', 'GET', undefined, '?select=*&order=started_at.desc&limit=5');
      return { recent_runs: Array.isArray(runs) ? runs : [] };
    }
    case 'xab_list_queue': {
      const params = `?${args.queue_name ? `queue_name=eq.${args.queue_name}&` : ''}${args.status ? `status=eq.${args.status}&` : ''}limit=20&order=created_at.desc`;
      const jobs = await sb('jobs', 'GET', undefined, params);
      return { jobs: Array.isArray(jobs) ? jobs : [] };
    }
    case 'xab_get_ncp_leads': {
      const leads = await sb('ncp_leads', 'GET', undefined, `?select=*&limit=${args.limit || 10}&order=created_at.desc`);
      return { leads: Array.isArray(leads) ? leads : [] };
    }
    case 'xab_get_ncp_opportunities': {
      const opps = await sb('ncp_opportunities', 'GET', undefined, `?select=*&limit=${args.limit || 10}&order=created_at.desc`);
      return { opportunities: Array.isArray(opps) ? opps : [] };
    }
    case 'xab_arm_kill_switch':
      return { blocked: true, message: 'Kill switch arming requires operator approval. Use the XAB dashboard.' };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function POST(req: NextRequest, { params }: { params: { transport: string } }) {
  const cron = req.headers.get('authorization');
  const body = await req.json().catch(() => ({}));
  const { method, id, params: rpcParams } = body;

  if (method === 'initialize') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'xab-mcp', version: XAB_VERSION } } });
  }
  if (method === 'tools/list') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }
  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = rpcParams || {};
    try {
      const result = await callTool(name, toolArgs || {});
      return NextResponse.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
    } catch (err: unknown) {
      return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32603, message: String(err) } });
    }
  }
  return NextResponse.json({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } }, { status: 404 });
}

export async function GET(req: NextRequest, { params }: { params: { transport: string } }) {
  return NextResponse.json({ name: 'xab-mcp', version: XAB_VERSION, tools: TOOLS.length, endpoint: '/api/mcp/mcp' });
}
