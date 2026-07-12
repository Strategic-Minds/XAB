/**
 * XAB Swarm Router
 * Routes tasks to appropriate agents based on type, capability, load.
 * Implements round-robin with priority weighting.
 */
import { createClient } from '@/lib/supabase/server';
import { enqueue } from './queue-engine';

export type TaskType =
  | 'BUILD_FEATURE'
  | 'VALIDATE_BUILD'
  | 'AUDIT_SYSTEM'
  | 'REPAIR_FINDING'
  | 'RESEARCH_SOURCE'
  | 'WRITE_DOCS'
  | 'MONITOR_HEALTH'
  | 'SECURITY_SCAN'
  | 'MANAGE_SANDBOX';

const TASK_TO_QUEUE: Record<TaskType, string> = {
  BUILD_FEATURE: 'build',
  VALIDATE_BUILD: 'validate',
  AUDIT_SYSTEM: 'audit',
  REPAIR_FINDING: 'repair',
  RESEARCH_SOURCE: 'research',
  WRITE_DOCS: 'build',
  MONITOR_HEALTH: 'audit',
  SECURITY_SCAN: 'validate',
  MANAGE_SANDBOX: 'sandbox_teardown',
};

const TASK_TO_AGENT_TYPE: Record<TaskType, string> = {
  BUILD_FEATURE: 'BUILDER',
  VALIDATE_BUILD: 'VALIDATOR',
  AUDIT_SYSTEM: 'AUDITOR',
  REPAIR_FINDING: 'REPAIRER',
  RESEARCH_SOURCE: 'RESEARCHER',
  WRITE_DOCS: 'WRITER',
  MONITOR_HEALTH: 'MONITOR',
  SECURITY_SCAN: 'SECURITY',
  MANAGE_SANDBOX: 'ORCHESTRATOR',
};

export async function routeTask(
  task_type: TaskType,
  payload: Record<string, unknown>,
  priority = 5
): Promise<{ job_id: string; queue: string; agent_type: string }> {
  const queue = TASK_TO_QUEUE[task_type];
  const agent_type = TASK_TO_AGENT_TYPE[task_type];

  const job_id = await enqueue(task_type, payload, {
    queue_name: queue,
    priority,
    idempotency_key: payload.idempotency_key as string | undefined,
    correlation_id: payload.correlation_id as string | undefined,
  });

  return { job_id, queue, agent_type };
}

export async function getAvailableAgent(agent_type: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('swarm_agents')
    .select('agent_id, current_job_count, max_concurrent_jobs')
    .eq('agent_type', agent_type)
    .eq('status', 'IDLE')
    .lt('current_job_count', supabase.rpc as never)
    .order('current_job_count', { ascending: true })
    .limit(1);
  return data?.[0]?.agent_id ?? null;
}

export async function broadcastToSwarm(
  from_agent: string,
  message_type: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();
  await supabase.from('swarm_messages').insert({
    message_id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    from_agent,
    broadcast: true,
    message_type: message_type as never,
    payload,
    correlation_id: payload.correlation_id as string | undefined,
  });
}