/**
 * XAB Swarm Dispatcher
 * Detects @mentions in orchestrator output, routes tasks to specialist agents.
 */
import { SupabaseClient } from '@supabase/supabase-js';

export const AGENT_HANDLES: Record<string, string> = {
  '@xab': 'AGT-501619f2',
  '@juno': 'AGT-3cf701a8',
  '@scout': 'AGT-310ddfe5',
  '@mira': 'AGT-49c9851e',
  '@rex': 'AGT-9ee3c896',
  '@aria': 'AGT-742fb457',
  '@kai': 'AGT-44fce80e',
};

export function detectAgentMentions(text: string): string[] {
  const mentions = text.match(/@(xab|juno|scout|mira|rex|aria|kai)/gi) ?? [];
  return [...new Set(mentions.map(m => m.toLowerCase()))];
}

export async function dispatchToAgent(
  fromAgentId: string,
  toHandle: string,
  task: string,
  context: Record<string, unknown>,
  supabase: SupabaseClient,
  conversationId?: string
): Promise<string> {
  const toAgentId = AGENT_HANDLES[toHandle.toLowerCase()];
  if (!toAgentId) throw new Error(`Unknown agent handle: ${toHandle}`);

  // Create a job record
  const jobRecord = {
    job_id: `job_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    job_type: 'AGENT_DISPATCH',
    queue_state: 'PENDING',
    attempt_count: 0,
    max_attempts: 3,
    assigned_agent: toAgentId,
    notes: JSON.stringify({ from: fromAgentId, to: toAgentId, handle: toHandle, task, context, conversationId }),
    scheduled_for: new Date().toISOString()
  };

  const { data } = await supabase.from('JobRegistry').insert(jobRecord).select().single();
  return data?.job_id ?? jobRecord.job_id;
}

export async function getAgentByHandle(handle: string, supabase: SupabaseClient) {
  const agentId = AGENT_HANDLES[handle.toLowerCase()];
  if (!agentId) return null;
  const { data } = await supabase.from('xab_agents').select('*').eq('agent_id', agentId).single();
  return data;
}