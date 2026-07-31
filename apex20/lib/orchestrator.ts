/**
 * APEX-20 Orchestrator — WF-03 Hybrid Adaptive
 * A01 decomposes operator intent → dependency DAG → parallel + sequential lanes.
 */
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type PacketStatus = 'queued' | 'claimed' | 'running' | 'complete' | 'failed' | 'quarantined';

export interface WorkPacket {
  id: string;
  project_id?: string;
  task_id?: string;
  packet_type: string;
  payload: Record<string, unknown>;
  assigned_agent?: string;
  status: PacketStatus;
  idempotency_key: string;
  metadata?: Record<string, unknown>;
}

export interface TaskNode {
  id: string;
  agent: string;
  description: string;
  dependsOn: string[];
  payload: Record<string, unknown>;
}

export interface TaskGraph {
  nodes: TaskNode[];
  parallel: TaskNode[][];   // Groups that can run concurrently
  sequential: TaskNode[];   // Must run in order after parallel
}

/**
 * Decompose operator intent into a WF-03 dependency DAG.
 * Groups independent tasks for parallel execution.
 */
export function decomposeIntent(
  description: string,
  tasks: TaskNode[]
): TaskGraph {
  // Build adjacency — which tasks have no remaining deps ready?
  const resolved = new Set<string>();
  const parallel: TaskNode[][] = [];
  const remaining = [...tasks];

  while (remaining.length > 0) {
    const ready = remaining.filter((n) => n.dependsOn.every((d) => resolved.has(d)));
    if (ready.length === 0) break; // Cycle guard

    parallel.push(ready);
    ready.forEach((n) => {
      resolved.add(n.id);
      remaining.splice(remaining.indexOf(n), 1);
    });
  }

  return { nodes: tasks, parallel, sequential: remaining };
}

/**
 * Atomically claim a work packet — prevents double-execution.
 * Uses optimistic update: status queued → claimed with agent lock.
 */
export async function claimWorkPacket(
  packetId: string,
  agentId: string
): Promise<WorkPacket | null> {
  const { data, error } = await db
    .from('apex20_work_packets')
    .update({
      status: 'claimed',
      assigned_agent: agentId,
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', packetId)
    .eq('status', 'queued') // Atomic guard
    .select()
    .single();

  if (error || !data) return null;
  return data as WorkPacket;
}

/**
 * Enqueue a batch of work packets for a task graph.
 */
export async function enqueueTaskGraph(
  graph: TaskGraph,
  projectId?: string
): Promise<string[]> {
  const packets = graph.nodes.map((node) => ({
    project_id: projectId,
    packet_type: node.agent,
    payload: { ...node.payload, description: node.description, depends_on: node.dependsOn },
    status: 'queued' as PacketStatus,
    assigned_agent: node.agent,
    idempotency_key: `${projectId ?? 'global'}-${node.id}-${Date.now()}`,
    metadata: { task_node_id: node.id },
  }));

  const { data, error } = await db.from('apex20_work_packets').insert(packets).select('id');
  if (error) throw new Error(`Enqueue failed: ${error.message}`);
  return (data ?? []).map((d: { id: string }) => d.id);
}

/**
 * Complete a work packet with result + receipt.
 */
export async function completePacket(
  packetId: string,
  result: Record<string, unknown>,
  receiptSummary: string
): Promise<void> {
  await db.from('apex20_work_packets').update({
    status: 'complete',
    completed_at: new Date().toISOString(),
    payload: result,
    updated_at: new Date().toISOString(),
  }).eq('id', packetId);

  await db.from('apex20_receipts').insert({
    receipt_type: 'PACKET_COMPLETE',
    related_id: packetId,
    action_summary: receiptSummary,
    produced_by: 'orchestrator',
    evidence: { result, completed_at: new Date().toISOString() },
  });
}

/**
 * Quarantine a failed packet after max attempts.
 */
export async function quarantinePacket(packetId: string, reason: string): Promise<void> {
  await db.from('apex20_work_packets').update({
    status: 'quarantined',
    updated_at: new Date().toISOString(),
    metadata: { quarantine_reason: reason, quarantined_at: new Date().toISOString() },
  }).eq('id', packetId);
}

/**
 * Pull next available queued packet for an agent type.
 */
export async function pollNextPacket(agentId: string): Promise<WorkPacket | null> {
  const { data } = await db
    .from('apex20_work_packets')
    .select()
    .eq('status', 'queued')
    .eq('assigned_agent', agentId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!data) return null;
  return claimWorkPacket(data.id, agentId);
}
