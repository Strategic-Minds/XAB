/**
 * XAB Sandbox Manager
 * Creates isolated build environments. Enforces resource limits.
 * All destructive operations happen in sandboxes — NEVER in production.
 */
import { createClient } from '@/lib/supabase/server';

export interface SandboxConfig {
  name: string;
  purpose: string;
  sandbox_type: 'BRANCH' | 'PREVIEW' | 'ISOLATED' | 'EPHEMERAL';
  owner_agent: string;
  parent_job_id?: string;
  git_branch?: string;
  env_overrides?: Record<string, string>;
  resource_limits?: {
    max_files?: number;
    max_api_calls?: number;
    max_duration_seconds?: number;
    max_cost_usd?: number;
  };
  auto_destroy_after_seconds?: number;
}

export interface Sandbox {
  sandbox_id: string;
  name: string;
  status: string;
  git_branch: string | null;
  vercel_deploy_url: string | null;
  resource_limits: Record<string, number>;
}

export async function createSandbox(config: SandboxConfig): Promise<Sandbox> {
  const supabase = createClient();
  const sandbox_id = `SBX-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const autoDestroyAt = config.auto_destroy_after_seconds
    ? new Date(Date.now() + config.auto_destroy_after_seconds * 1000).toISOString()
    : new Date(Date.now() + 3600 * 1000).toISOString(); // Default 1hr

  const limits = {
    max_files: config.resource_limits?.max_files ?? 50,
    max_api_calls: config.resource_limits?.max_api_calls ?? 1000,
    max_duration_seconds: config.resource_limits?.max_duration_seconds ?? 3600,
    max_cost_usd: config.resource_limits?.max_cost_usd ?? 1.0,
  };

  const { data, error } = await supabase.from('sandboxes').insert({
    sandbox_id,
    name: config.name,
    purpose: config.purpose,
    sandbox_type: config.sandbox_type,
    status: 'INITIALIZING',
    owner_agent: config.owner_agent,
    parent_job_id: config.parent_job_id,
    git_branch: config.git_branch,
    env_overrides: config.env_overrides ?? {},
    resource_limits: limits,
    auto_destroy_at: autoDestroyAt,
    activated_at: new Date().toISOString(),
  }).select().single();

  if (error) throw new Error(`Failed to create sandbox: ${error.message}`);

  await supabase.from('sandboxes').update({ status: 'ACTIVE' }).eq('sandbox_id', sandbox_id);
  return { sandbox_id, name: config.name, status: 'ACTIVE', git_branch: config.git_branch ?? null, vercel_deploy_url: null, resource_limits: limits };
}

export async function recordSandboxAction(
  sandbox_id: string,
  job_id: string | null,
  action_type: string,
  payload: Record<string, unknown>
): Promise<string> {
  const supabase = createClient();
  const action_id = `ACT-${sandbox_id}-${Date.now()}`;
  await supabase.from('sandbox_actions').insert({
    action_id, sandbox_id, job_id, action_type,
    action_payload: payload,
    status: 'RUNNING',
  });
  return action_id;
}

export async function completeSandboxAction(
  action_id: string,
  result: Record<string, unknown>,
  status: 'COMPLETED' | 'FAILED' | 'ROLLED_BACK' = 'COMPLETED'
): Promise<void> {
  const supabase = createClient();
  await supabase.from('sandbox_actions').update({
    status,
    result,
    completed_at: new Date().toISOString(),
  }).eq('action_id', action_id);
}

export async function destroySandbox(sandbox_id: string, reason: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('sandboxes').update({
    status: 'DESTROYED',
    destroyed_at: new Date().toISOString(),
    notes: `Destroyed: ${reason}`,
  }).eq('sandbox_id', sandbox_id);
}

export async function checkResourceLimits(sandbox_id: string): Promise<{ ok: boolean; violations: string[] }> {
  const supabase = createClient();
  const { data: sandbox } = await supabase.from('sandboxes').select('resource_limits, actual_cost_usd, files_created, api_calls_made').eq('sandbox_id', sandbox_id).single();
  if (!sandbox) return { ok: false, violations: ['Sandbox not found'] };

  const violations: string[] = [];
  const limits = sandbox.resource_limits as Record<string, number>;

  if (sandbox.actual_cost_usd > limits.max_cost_usd) violations.push(`Cost $${sandbox.actual_cost_usd} exceeds $${limits.max_cost_usd}`);
  if (sandbox.files_created > limits.max_files) violations.push(`Files ${sandbox.files_created} exceeds ${limits.max_files}`);
  if (sandbox.api_calls_made > limits.max_api_calls) violations.push(`API calls ${sandbox.api_calls_made} exceeds ${limits.max_api_calls}`);

  return { ok: violations.length === 0, violations };
}