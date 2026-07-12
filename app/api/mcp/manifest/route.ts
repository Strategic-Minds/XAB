import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    schema_version: '2.0.0',
    name: 'XAB Unified MCP Gateway',
    description: 'Unified MCP gateway for XAB autonomous build system. 37 tools across build, queue, sandbox, quarantine, swarm, and intelligence domains.',
    version: '1.0.0',
    repo: 'Strategic-Minds/XAB',
    repo_id: '1297990651',
    mcp_url: 'https://xab-system.vercel.app/api/mcp/mcp',
    tool_count: 37,
    namespaces: [
      { id: 'xab.control', description: 'Health, status, bootstrap' },
      { id: 'xab.build', description: 'Repo, files, GitHub operations' },
      { id: 'xab.queue', description: 'Job queue, DLQ, requeue' },
      { id: 'xab.sandbox', description: 'Create, monitor, destroy sandboxes' },
      { id: 'xab.quarantine', description: 'Threat detection and quarantine' },
      { id: 'xab.swarm', description: 'Agent status, messages, orchestration' },
      { id: 'xab.playbooks', description: 'Playbook list and trigger' },
      { id: 'xab.audit', description: 'Findings, score, cron health' },
      { id: 'xab.drive', description: 'Google Drive operations (dry_run by default)' },
      { id: 'xab.platform', description: 'GitHub, Vercel, AI Gateway provisioning' },
    ],
    governance: {
      default_mode: 'dry_run',
      protected_actions: ['PRODUCTION_DEPLOY', 'MERGE_PROTECTED_BRANCH', 'ARM_KILL_SWITCH'],
      approval_required_phrase: 'APPROVE [ACTION]',
    },
  });
}
