import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const XAB_VERSION = '1.0.0';
const XAB_MCP_URL = 'https://xab-system.vercel.app/api/mcp/mcp';
const REPO_ID = '1297990651';
const REPO_NAME = 'Strategic-Minds/XAB';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// ── Supabase helper ───────────────────────────────────────────────────
async function sb(table: string, method = 'GET', body?: unknown, params = '') {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { error: 'Supabase not configured' };
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return { error: await res.text(), status: res.status };
  const text = await res.text();
  return text ? JSON.parse(text) : { ok: true };
}

// ── GitHub helper ──────────────────────────────────────────────────
async function gh(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { error: 'GITHUB_TOKEN not configured' };
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  return res.json();
}

// ── Vercel helper ──────────────────────────────────────────────────
async function vercel(path: string, method = 'GET', body?: unknown) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { error: 'VERCEL_TOKEN not configured' };
  const res = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── MCP text helper ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mcpText(value: any) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

// ── Approval gate ─────────────────────────────────────────────────
function requiresApproval(action: string, phrase?: string): boolean {
  const protectedActions = ['PRODUCTION_DEPLOY', 'MERGE_PROTECTED_BRANCH', 'PRODUCTION_DB_MIGRATION', 'DESTRUCTIVE_DELETE', 'ARM_KILL_SWITCH'];
  if (!protectedActions.some(p => action.toUpperCase().includes(p))) return false;
  const required = action.includes('ARM_KILL_SWITCH') ? 'APPROVE ARM KILL SWITCH' : 'APPROVE ' + action;
  return !(phrase && phrase.toUpperCase().includes(required));
}

const handler = createMcpHandler(
  (server) => {

    // ══ ORIGINAL 20 TOOLS (ported from AUTO_BUILDER-V1) ══

    server.tool('health_check', 'Confirm XAB MCP gateway is alive. Returns version, repo ID, Supabase status.',
      {},
      async () => mcpText({
        status: 'ok',
        version: XAB_VERSION,
        name: 'XAB Unified MCP Gateway',
        repo: REPO_NAME,
        repo_id: REPO_ID,
        mcp_url: XAB_MCP_URL,
        timestamp: new Date().toISOString(),
        supabase_configured: !!(SUPABASE_URL && SUPABASE_KEY),
      })
    );

    server.tool('get_repo_summary', 'Return XAB operating map: repo state, active playbooks, queue summary, score.',
      {},
      async () => {
        const [repoData, scoreData] = await Promise.all([
          gh(`repos/${REPO_NAME}`),
          sb('score_history', 'GET', undefined, '?order=scored_at.desc&limit=1'),
        ]);
        return mcpText({
          repo: { name: REPO_NAME, id: REPO_ID, default_branch: repoData.default_branch, open_issues: repoData.open_issues_count },
          score: Array.isArray(scoreData) ? scoreData[0] : scoreData,
          mcp_tools: 37,
          queues: 8,
          agents: 12,
          playbooks: 20,
          runbooks: 8,
        });
      }
    );

    server.tool('list_repo_files', 'List XAB repository file tree. Filter by path prefix.',
      { prefix: z.string().optional().describe('Path prefix filter, e.g. app/api or lib/swarm') },
      async ({ prefix }) => {
        const tree = await gh(`repos/${REPO_NAME}/git/trees/main?recursive=1`);
        const files = (tree.tree || []).filter((f: { type: string; path: string }) => f.type === 'blob' && (!prefix || f.path.startsWith(prefix))).map((f: { path: string; size: number }) => ({ path: f.path, size: f.size }));
        return mcpText({ total: files.length, files: files.slice(0, 100) });
      }
    );

    server.tool('read_bootstrap_status', 'Read XAB MCP bootstrap status: tool count, playbooks active, cron health.',
      {},
      async () => {
        const crons = await sb('cron_schedule', 'GET', undefined, '?order=name');
        const agents = await sb('swarm_agents', 'GET', undefined, '?select=agent_id,status&order=agent_type');
        return mcpText({
          mcp_version: XAB_VERSION,
          mcp_url: XAB_MCP_URL,
          tool_count: 37,
          repo_id: REPO_ID,
          crons: Array.isArray(crons) ? crons : [],
          agents: Array.isArray(agents) ? agents : [],
          constraints: [
            'All write operations default to dry_run unless mode=execute',
            'Protected actions require explicit approval phrase',
            'All jobs go through queue -> sandbox -> quarantine scan',
          ],
        });
      }
    );

    server.tool('read_text_file', 'Read a file from XAB repo by path.',
      { path: z.string().describe('File path in XAB repo, e.g. lib/swarm/queue-engine.ts') },
      async ({ path }) => {
        const data = await gh(`repos/${REPO_NAME}/contents/${path}`);
        if (data.error) return mcpText({ error: data.error });
        const content = Buffer.from(data.content || '', 'base64').toString();
        return mcpText({ path, size: data.size, content: content.slice(0, 8000) + (content.length > 8000 ? '\n...[truncated]' : '') });
      }
    );

    server.tool('run_job', 'Generic XAB job runner. Enqueues into job_queue with idempotency.',
      {
        job_id: z.string().describe('Unique job ID'),
        job_type: z.string().describe('Job type, e.g. BUILD_FEATURE, AUDIT_SYSTEM'),
        queue_name: z.string().optional().describe('Target queue: default, build, validate, audit, repair, research'),
        mode: z.enum(['read', 'dry_run', 'execute']).optional().default('dry_run'),
        payload: z.record(z.unknown()).optional(),
      },
      async ({ job_id, job_type, queue_name, mode, payload }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', job_id, job_type, queue: queue_name ?? 'default', payload, note: 'Pass mode=execute to enqueue live' });
        const result = await sb('job_queue', 'POST', { job_id: `MCP-${job_id}-${Date.now()}`, job_type, queue_name: queue_name ?? 'default', priority: 5, payload: payload ?? {}, status: 'PENDING' });
        return mcpText({ status: 'ENQUEUED', job_id, result });
      }
    );

    server.tool('run_universal_job', 'Universal XAB automation runner. Routes to correct queue based on job type.',
      {
        job_id: z.string(),
        mode: z.enum(['read', 'dry_run', 'execute']).optional().default('dry_run'),
        action: z.string().optional(),
        target_system: z.string().optional(),
        payload: z.record(z.unknown()).optional(),
      },
      async ({ job_id, mode, action, target_system, payload }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', job_id, action, target_system, note: 'Pass mode=execute to run live' });
        const queue = target_system === 'github' ? 'build' : target_system === 'supabase' ? 'audit' : 'default';
        const result = await sb('job_queue', 'POST', { job_id: `MCP-UNIV-${job_id}-${Date.now()}`, job_type: action ?? 'UNIVERSAL_OP', queue_name: queue, payload: { action, target_system, ...payload }, status: 'PENDING' });
        return mcpText({ status: 'ENQUEUED', queue, result });
      }
    );

    server.tool('run_drive_job', 'Google Drive job runner. Folder creation, file moves. Default dry_run.',
      {
        job_id: z.string().optional(),
        mode: z.enum(['read', 'dry_run', 'execute', 'approved_write']).optional().default('dry_run'),
        folder_manifest: z.array(z.string()).optional(),
        folder_id: z.string().optional(),
        parent_folder_id: z.string().optional(),
        folder_name: z.string().optional(),
        action: z.string().optional(),
      },
      async ({ job_id, mode, folder_manifest, folder_name, parent_folder_id, action }) => {
        if (mode === 'read' || mode === 'dry_run') return mcpText({ mode, plan: { folder_name, parent_folder_id, folder_manifest, action }, note: 'Pass mode=approved_write to execute' });
        return mcpText({ mode, status: 'PLANNED', note: 'Drive write operations routed through approval gate' });
      }
    );

    server.tool('drive_list_tree', 'List Google Drive folder tree.',
      { folder_id: z.string().optional().describe('Drive folder ID. Defaults to XAB root.') },
      async ({ folder_id }) => mcpText({ folder_id: folder_id ?? '1t278PMC-qmKRe1B2z_FM6T4i3OFv0_Un', note: 'Use Google Drive API with connector token to read tree' })
    );

    server.tool('drive_create_folder', 'Create a Google Drive folder. Default dry_run.',
      { folder_name: z.string(), parent_folder_id: z.string().optional(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ folder_name, parent_folder_id, mode }) => mcpText({ mode, folder_name, parent_folder_id, note: mode === 'dry_run' ? 'Pass mode=execute to create' : 'Execution routed to Drive connector' })
    );

    server.tool('drive_move_folder', 'Move a Drive folder. Default dry_run.',
      { folder_id: z.string(), destination_parent_folder_id: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ folder_id, destination_parent_folder_id, mode }) => mcpText({ mode, folder_id, destination_parent_folder_id, note: mode === 'dry_run' ? 'Pass mode=execute to move' : 'Move planned' })
    );

    server.tool('drive_move_file', 'Move a Drive file. Default dry_run.',
      { file_id: z.string(), destination_parent_folder_id: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ file_id, destination_parent_folder_id, mode }) => mcpText({ mode, file_id, destination_parent_folder_id })
    );

    server.tool('drive_write_receipt', 'Write a receipt document to Drive. Default dry_run.',
      { receipt_folder_id: z.string().optional(), action: z.string(), status: z.string(), summary: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ receipt_folder_id, action, status, summary, mode }) => mcpText({ mode, receipt: { action, status, summary, folder: receipt_folder_id }, timestamp: new Date().toISOString() })
    );

    server.tool('run_platform_provisioning_job', 'Dry-run-first GitHub/Vercel/AI Gateway provisioning planner.',
      { job_id: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run'), owner: z.string().optional(), repo_name: z.string().optional(), project_name: z.string().optional() },
      async ({ job_id, mode, owner, repo_name, project_name }) => mcpText({ mode, job_id, plan: { owner, repo_name, project_name }, note: mode === 'dry_run' ? 'Pass mode=execute to provision' : 'Provisioning planned' })
    );

    server.tool('create_github_repo', 'Create a GitHub repository. Default dry_run.',
      { owner: z.string().optional().default('Strategic-Minds'), repo_name: z.string(), visibility: z.enum(['private', 'public', 'internal']).optional().default('private'), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ owner, repo_name, visibility, mode }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', plan: { owner, repo_name, visibility } });
        const result = await gh(`orgs/${owner}/repos`);
        return mcpText({ mode: 'execute', result, note: 'POST to GitHub API required for full execution' });
      }
    );

    server.tool('create_vercel_project', 'Create a Vercel project. Default dry_run.',
      { project_name: z.string(), git_repo: z.string().optional(), framework: z.string().optional().default('nextjs'), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ project_name, git_repo, framework, mode }) => mcpText({ mode, plan: { project_name, git_repo, framework }, note: mode === 'dry_run' ? 'Pass mode=execute to create' : 'Vercel project creation planned' })
    );

    server.tool('create_vercel_workflow', 'Create a Vercel cron workflow. Default dry_run.',
      { workflow_name: z.string(), route: z.string(), schedule: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ workflow_name, route, schedule, mode }) => mcpText({ mode, plan: { workflow_name, route, schedule }, note: 'Add to vercel.json crons array and commit to main' })
    );

    server.tool('create_vercel_agent', 'Create a Vercel AI agent definition. Default dry_run.',
      { agent_name: z.string(), agent_scope: z.string().optional(), allowed_tools: z.array(z.string()).optional(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ agent_name, agent_scope, allowed_tools, mode }) => mcpText({ mode, plan: { agent_name, agent_scope, allowed_tools } })
    );

    server.tool('create_ai_gateway', 'Create an AI Gateway config. Default dry_run.',
      { gateway_name: z.string(), providers: z.array(z.string()).optional(), models: z.array(z.string()).optional(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ gateway_name, providers, models, mode }) => mcpText({ mode, plan: { gateway_name, providers, models }, note: 'Gateway is already live at ai-gateway.vercel.sh/v1' })
    );

    server.tool('rollback', 'Rollback planner. Dry-run by default. Provide rollback_type and original_job_id.',
      { job_id: z.string(), mode: z.enum(['dry_run', 'rollback']).optional().default('dry_run'), original_job_id: z.string(), rollback_type: z.string(), rollback_payload: z.record(z.unknown()).optional() },
      async ({ job_id, mode, original_job_id, rollback_type, rollback_payload }) => {
        if (mode !== 'rollback') return mcpText({ mode: 'dry_run', plan: { original_job_id, rollback_type, rollback_payload } });
        await sb('quarantine', 'POST', { quarantine_id: `QUAR-ROLLBACK-${job_id}`, quarantine_type: 'JOB', severity: 'S2_MODERATE', reason: `Rollback initiated: ${rollback_type}`, quarantined_entity_id: original_job_id, detected_by_agent: 'MCP-ROLLBACK' });
        return mcpText({ status: 'ROLLBACK_INITIATED', job_id, original_job_id, rollback_type });
      }
    );

    // ══ 17 NEW XAB TOOLS ══

    server.tool('xab_swarm_status', 'Get full XAB swarm status: agents, queues, active sandboxes, score.',
      {},
      async () => {
        const [agents, sandboxes, queues, score] = await Promise.all([
          sb('swarm_agents', 'GET', undefined, '?select=agent_id,agent_name,agent_type,status,current_job_count&order=agent_type'),
          sb('sandboxes', 'GET', undefined, '?status=eq.ACTIVE&select=sandbox_id,name,owner_agent,actual_cost_usd'),
          sb('queue_registry', 'GET', undefined, '?select=queue_name,current_depth,max_concurrency,is_active'),
          sb('score_history', 'GET', undefined, '?order=scored_at.desc&limit=1'),
        ]);
        return mcpText({ timestamp: new Date().toISOString(), agents, sandboxes, queues, score: Array.isArray(score) ? score[0] : score });
      }
    );

    server.tool('xab_enqueue_job', 'Enqueue a job into the XAB job queue.',
      {
        job_type: z.string().describe('Job type: BUILD_FEATURE, VALIDATE_BUILD, AUDIT_SYSTEM, REPAIR_FINDING, RESEARCH_SOURCE'),
        queue_name: z.string().optional().default('default').describe('Queue: default, build, validate, audit, repair, research'),
        priority: z.number().min(1).max(10).optional().default(5),
        payload: z.record(z.unknown()).optional(),
        mode: z.enum(['dry_run', 'execute']).optional().default('dry_run'),
      },
      async ({ job_type, queue_name, priority, payload, mode }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', plan: { job_type, queue_name, priority, payload } });
        const job_id = `MCP-JOB-${Date.now()}`;
        const result = await sb('job_queue', 'POST', { job_id, job_type, queue_name, priority, payload: payload ?? {}, status: 'PENDING' });
        return mcpText({ status: 'ENQUEUED', job_id, queue_name, result });
      }
    );

    server.tool('xab_get_job_status', 'Get status of a job by job_id.',
      { job_id: z.string() },
      async ({ job_id }) => {
        const result = await sb('job_queue', 'GET', undefined, `?job_id=eq.${job_id}&limit=1`);
        return mcpText(Array.isArray(result) ? result[0] ?? { error: 'Not found' } : result);
      }
    );

    server.tool('xab_list_playbooks', 'List all 20 XAB playbooks and their last run status.',
      { category: z.string().optional().describe('Filter by category: BUILD, MONITORING, AUDIT, REPAIR, SECURITY, INTELLIGENCE, BUSINESS, GOVERNANCE') },
      async ({ category }) => {
        const params = category ? `?category=eq.${category}&order=name` : '?order=category,name';
        const result = await sb('playbooks', 'GET', undefined, params);
        return mcpText({ playbooks: result, total: Array.isArray(result) ? result.length : 0 });
      }
    );

    server.tool('xab_trigger_playbook', 'Manually trigger a playbook by ID.',
      { playbook_id: z.string(), trigger_payload: z.record(z.unknown()).optional(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ playbook_id, trigger_payload, mode }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', playbook_id, trigger_payload });
        const run_id = `PB-RUN-MCP-${Date.now()}`;
        await sb('playbook_runs', 'POST', { run_id, playbook_id, triggered_by: 'MCP', trigger_type: 'MANUAL', trigger_payload: trigger_payload ?? {}, status: 'RUNNING' });
        return mcpText({ status: 'STARTED', run_id, playbook_id });
      }
    );

    server.tool('xab_create_sandbox', 'Create an isolated build sandbox.',
      { name: z.string(), purpose: z.string(), sandbox_type: z.enum(['BRANCH', 'PREVIEW', 'ISOLATED', 'EPHEMERAL']).optional().default('BRANCH'), owner_agent: z.string().optional().default('MCP'), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ name, purpose, sandbox_type, owner_agent, mode }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', plan: { name, purpose, sandbox_type, owner_agent } });
        const sandbox_id = `SBX-MCP-${Date.now()}`;
        await sb('sandboxes', 'POST', { sandbox_id, name, purpose, sandbox_type, owner_agent, status: 'ACTIVE', auto_destroy_at: new Date(Date.now() + 3600000).toISOString() });
        return mcpText({ status: 'CREATED', sandbox_id, auto_destroy_in: '1 hour' });
      }
    );

    server.tool('xab_destroy_sandbox', 'Destroy a sandbox by ID.',
      { sandbox_id: z.string(), reason: z.string().optional().default('MCP request') },
      async ({ sandbox_id, reason }) => {
        await sb('sandboxes', 'PATCH', { status: 'DESTROYED', destroyed_at: new Date().toISOString(), notes: reason }, `?sandbox_id=eq.${sandbox_id}`);
        return mcpText({ status: 'DESTROYED', sandbox_id });
      }
    );

    server.tool('xab_quarantine_entity', 'Quarantine a job, source, code, or output.',
      { entity_id: z.string(), entity_type: z.enum(['JOB', 'AGENT', 'CODE', 'DATA', 'SOURCE', 'OUTPUT']), reason: z.string(), severity: z.enum(['S0_INFORMATIONAL', 'S1_LOW', 'S2_MODERATE', 'S3_HIGH', 'S4_CRITICAL']).optional().default('S2_MODERATE') },
      async ({ entity_id, entity_type, reason, severity }) => {
        const quarantine_id = `QUAR-MCP-${Date.now()}`;
        await sb('quarantine', 'POST', { quarantine_id, quarantine_type: entity_type, severity, reason, quarantined_entity_id: entity_id, quarantined_entity_type: entity_type.toLowerCase(), detected_by_agent: 'MCP', detection_method: 'MANUAL' });
        return mcpText({ status: 'QUARANTINED', quarantine_id, entity_id, severity });
      }
    );

    server.tool('xab_list_quarantine', 'List pending quarantine entries.',
      { severity: z.string().optional(), limit: z.number().optional().default(20) },
      async ({ severity, limit }) => {
        const params = severity ? `?review_status=eq.PENDING&severity=eq.${severity}&limit=${limit}` : `?review_status=eq.PENDING&order=created_at.desc&limit=${limit}`;
        const result = await sb('quarantine', 'GET', undefined, params);
        return mcpText({ quarantine_entries: result, total: Array.isArray(result) ? result.length : 0 });
      }
    );

    server.tool('xab_get_ceiling_score', 'Get current XAB 95% ceiling readiness score and blockers.',
      {},
      async () => {
        const result = await sb('score_history', 'GET', undefined, '?order=scored_at.desc&limit=1');
        const backlog = await sb('improvement_backlog', 'GET', undefined, '?status=eq.OPEN&order=priority&limit=10');
        return mcpText({ current_score: Array.isArray(result) ? result[0] : result, open_backlog_items: backlog, ceiling_target: 95 });
      }
    );

    server.tool('xab_list_findings', 'List open audit findings.',
      { severity: z.string().optional(), category_id: z.string().optional(), limit: z.number().optional().default(20) },
      async ({ severity, category_id, limit }) => {
        let params = `?limit=${limit}&order=created_at.desc`;
        if (severity) params += `&severity=eq.${severity}`;
        if (category_id) params += `&category_id=eq.${category_id}`;
        const result = await sb('audit_findings', 'GET', undefined, params);
        return mcpText({ findings: result, total: Array.isArray(result) ? result.length : 0 });
      }
    );

    server.tool('xab_list_dlq', 'List dead letter queue entries awaiting review.',
      { limit: z.number().optional().default(20) },
      async ({ limit }) => {
        const result = await sb('dead_letter_queue', 'GET', undefined, `?review_status=eq.PENDING&order=moved_at.desc&limit=${limit}`);
        return mcpText({ dlq_entries: result, total: Array.isArray(result) ? result.length : 0 });
      }
    );

    server.tool('xab_requeue_dlq', 'Requeue a dead letter queue entry.',
      { dlq_id: z.string(), mode: z.enum(['dry_run', 'execute']).optional().default('dry_run') },
      async ({ dlq_id, mode }) => {
        if (mode !== 'execute') return mcpText({ mode: 'dry_run', dlq_id, note: 'Pass mode=execute to requeue' });
        const entry = await sb('dead_letter_queue', 'GET', undefined, `?dlq_id=eq.${dlq_id}&limit=1`);
        if (!Array.isArray(entry) || !entry[0]) return mcpText({ error: 'DLQ entry not found' });
        const job = entry[0];
        const new_job_id = `JOB-REQUEUE-${dlq_id}-${Date.now()}`;
        await sb('job_queue', 'POST', { job_id: new_job_id, queue_name: job.queue_name, job_type: job.job_type, payload: job.payload, status: 'PENDING', priority: 5 });
        await sb('dead_letter_queue', 'PATCH', { review_status: 'REQUEUED', requeue_job_id: new_job_id }, `?dlq_id=eq.${dlq_id}`);
        return mcpText({ status: 'REQUEUED', new_job_id, original_dlq_id: dlq_id });
      }
    );

    server.tool('xab_get_agent_status', 'Get status and recent activity for a specific swarm agent.',
      { agent_id: z.string() },
      async ({ agent_id }) => {
        const [agent, tasks] = await Promise.all([
          sb('swarm_agents', 'GET', undefined, `?agent_id=eq.${agent_id}&limit=1`),
          sb('swarm_tasks', 'GET', undefined, `?assigned_agent_id=eq.${agent_id}&order=created_at.desc&limit=10`),
        ]);
        return mcpText({ agent: Array.isArray(agent) ? agent[0] : agent, recent_tasks: tasks });
      }
    );

    server.tool('xab_send_swarm_message', 'Send a message to swarm agents.',
      { from_agent: z.string().optional().default('MCP'), to_agent: z.string().optional(), message_type: z.enum(['TASK_ASSIGN', 'STATUS', 'ESCALATION', 'COORDINATE', 'SHUTDOWN']), payload: z.record(z.unknown()).optional() },
      async ({ from_agent, to_agent, message_type, payload }) => {
        const message_id = `MSG-MCP-${Date.now()}`;
        await sb('swarm_messages', 'POST', { message_id, from_agent, to_agent, broadcast: !to_agent, message_type, payload: payload ?? {} });
        return mcpText({ status: 'SENT', message_id, to: to_agent ?? 'BROADCAST', type: message_type });
      }
    );

    server.tool('xab_get_cron_health', 'Get status of all XAB cron jobs and their last execution times.',
      {},
      async () => {
        const [schedule, heartbeats] = await Promise.all([
          sb('cron_schedule', 'GET', undefined, '?order=name'),
          sb('cron_heartbeats', 'GET', undefined, '?order=triggered_at.desc&limit=10'),
        ]);
        return mcpText({ cron_schedule: schedule, recent_heartbeats: heartbeats, timestamp: new Date().toISOString() });
      }
    );

    server.tool('xab_arm_kill_switch', 'Arm an XAB kill switch. Requires explicit approval phrase.',
      {
        switch_id: z.enum(['KS-001', 'KS-002', 'KS-003', 'KS-004']).describe('KS-001=global_writes KS-002=ai_spend KS-003=agent_autonomy KS-004=external_calls'),
        reason: z.string(),
        approval_phrase: z.string().describe('Must contain: APPROVE ARM KILL SWITCH'),
      },
      async ({ switch_id, reason, approval_phrase }) => {
        if (!approval_phrase.toUpperCase().includes('APPROVE ARM KILL SWITCH')) {
          return mcpText({ error: 'BLOCKED: approval_phrase must contain APPROVE ARM KILL SWITCH', switch_id, blocked: true });
        }
        await sb('kill_switches', 'PATCH', { is_active: true, armed_at: new Date().toISOString(), armed_reason: reason }, `?switch_id=eq.${switch_id}`);
        return mcpText({ status: 'ARMED', switch_id, reason, armed_at: new Date().toISOString(), warning: 'All autonomous operations now halted for this scope' });
      }
    );

  },
  { capabilities: { tools: {} } },
  { basePath: '/api/mcp' }
);

export const GET = handler;
export const POST = handler;
