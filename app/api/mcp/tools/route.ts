import { NextResponse } from 'next/server';

const TOOLS = [
  // Original 20
  { name: 'health_check', category: 'xab.control', safe: true },
  { name: 'get_repo_summary', category: 'xab.build', safe: true },
  { name: 'list_repo_files', category: 'xab.build', safe: true },
  { name: 'read_bootstrap_status', category: 'xab.control', safe: true },
  { name: 'read_text_file', category: 'xab.build', safe: true },
  { name: 'run_job', category: 'xab.queue', safe: false, default_mode: 'dry_run' },
  { name: 'run_universal_job', category: 'xab.queue', safe: false, default_mode: 'dry_run' },
  { name: 'run_drive_job', category: 'xab.drive', safe: false, default_mode: 'dry_run' },
  { name: 'drive_list_tree', category: 'xab.drive', safe: true },
  { name: 'drive_create_folder', category: 'xab.drive', safe: false, default_mode: 'dry_run' },
  { name: 'drive_move_folder', category: 'xab.drive', safe: false, default_mode: 'dry_run' },
  { name: 'drive_move_file', category: 'xab.drive', safe: false, default_mode: 'dry_run' },
  { name: 'drive_write_receipt', category: 'xab.drive', safe: false, default_mode: 'dry_run' },
  { name: 'run_platform_provisioning_job', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'create_github_repo', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'create_vercel_project', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'create_vercel_workflow', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'create_vercel_agent', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'create_ai_gateway', category: 'xab.platform', safe: false, default_mode: 'dry_run' },
  { name: 'rollback', category: 'xab.queue', safe: false, default_mode: 'dry_run' },
  // New XAB 17
  { name: 'xab_swarm_status', category: 'xab.swarm', safe: true },
  { name: 'xab_enqueue_job', category: 'xab.queue', safe: false, default_mode: 'dry_run' },
  { name: 'xab_get_job_status', category: 'xab.queue', safe: true },
  { name: 'xab_list_playbooks', category: 'xab.playbooks', safe: true },
  { name: 'xab_trigger_playbook', category: 'xab.playbooks', safe: false, default_mode: 'dry_run' },
  { name: 'xab_create_sandbox', category: 'xab.sandbox', safe: false, default_mode: 'dry_run' },
  { name: 'xab_destroy_sandbox', category: 'xab.sandbox', safe: false },
  { name: 'xab_quarantine_entity', category: 'xab.quarantine', safe: false },
  { name: 'xab_list_quarantine', category: 'xab.quarantine', safe: true },
  { name: 'xab_get_ceiling_score', category: 'xab.audit', safe: true },
  { name: 'xab_list_findings', category: 'xab.audit', safe: true },
  { name: 'xab_list_dlq', category: 'xab.queue', safe: true },
  { name: 'xab_requeue_dlq', category: 'xab.queue', safe: false, default_mode: 'dry_run' },
  { name: 'xab_get_agent_status', category: 'xab.swarm', safe: true },
  { name: 'xab_send_swarm_message', category: 'xab.swarm', safe: false },
  { name: 'xab_get_cron_health', category: 'xab.audit', safe: true },
  { name: 'xab_arm_kill_switch', category: 'xab.swarm', safe: false, requires_approval: true },
];

export async function GET() {
  return NextResponse.json({ tools: TOOLS, total: TOOLS.length, version: '1.0.0' });
}
