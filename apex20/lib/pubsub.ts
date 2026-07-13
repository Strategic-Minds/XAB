/**
 * APEX-20 Pub/Sub Client — Supabase Realtime
 * Real event-driven multi-agent communication layer.
 * Persist-then-broadcast pattern: messages are durable before being surfaced.
 */
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AgentState = 'idle' | 'working' | 'waiting_approval' | 'error' | 'offline';

export interface AgentMessage {
  id: string;
  room_id: string;
  conversation_id?: string;
  sender_agent_id?: string;
  sender_user_id?: string;
  content: string;
  message_type: 'text' | 'tool_call' | 'artifact' | 'approval_request' | 'handoff' | 'system';
  parent_message_id?: string;
  sequence_number?: number;
  idempotency_key: string;
  delivery_state: 'delivered' | 'failed' | 'retry';
  metadata?: Record<string, unknown>;
  created_at: string;
}

const activeChannels = new Map<string, RealtimeChannel>();
const processedKeys = new Set<string>();

/**
 * Create or join a multi-agent room.
 */
export async function createAgentRoom(
  roomName: string,
  members: string[],
  topic?: string
): Promise<{ roomId: string; error?: string }> {
  const { data, error } = await serviceClient
    .from('apex20_agent_rooms')
    .insert({ room_name: roomName, topic, status: 'active', metadata: { members } })
    .select('id')
    .single();

  if (error) return { roomId: '', error: error.message };

  // Add members
  if (members.length > 0) {
    await serviceClient.from('apex20_agent_room_members').insert(
      members.map((agent_id) => ({ room_id: data.id, agent_id, role: 'member' }))
    );
  }

  return { roomId: data.id };
}

/**
 * Subscribe to a private room channel.
 * Uses Supabase Realtime Broadcast with DB-level persistence.
 */
export function subscribeToRoom(
  roomId: string,
  onMessage: (msg: AgentMessage) => void,
  onPresence?: (state: Record<string, unknown>) => void
): () => void {
  if (activeChannels.has(roomId)) {
    activeChannels.get(roomId)!.unsubscribe();
  }

  const channel = supabase.channel(`apex20-room-${roomId}`, {
    config: { broadcast: { self: false }, presence: { key: 'agent_id' } },
  });

  channel
    .on('broadcast', { event: 'agent_message' }, ({ payload }) => {
      const msg = payload as AgentMessage;
      // Deduplication via idempotency key
      if (processedKeys.has(msg.idempotency_key)) return;
      processedKeys.add(msg.idempotency_key);
      onMessage(msg);
    })
    .on('presence', { event: 'sync' }, () => {
      if (onPresence) onPresence(channel.presenceState());
    })
    .subscribe();

  activeChannels.set(roomId, channel);

  // Return unsubscribe fn
  return () => {
    channel.unsubscribe();
    activeChannels.delete(roomId);
  };
}

/**
 * Publish a message: persist to DB first, then broadcast.
 * Idempotency key prevents duplicate processing on reconnect.
 */
export async function publishMessage(
  roomId: string,
  content: string,
  opts: {
    agentId?: string;
    userId?: string;
    messageType?: AgentMessage['message_type'];
    parentMessageId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<{ messageId: string; error?: string }> {
  const idempotencyKey = opts.idempotencyKey ?? `${roomId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Step 1: Persist to DB (durable)
  const { data, error } = await serviceClient
    .from('apex20_agent_messages')
    .insert({
      room_id: roomId,
      sender_agent_id: opts.agentId,
      sender_user_id: opts.userId,
      content,
      message_type: opts.messageType ?? 'text',
      parent_message_id: opts.parentMessageId,
      idempotency_key: idempotencyKey,
      delivery_state: 'delivered',
      metadata: opts.metadata ?? {},
    })
    .select('id, sequence_number, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return { messageId: '', error: 'duplicate' };
    return { messageId: '', error: error.message };
  }

  // Step 2: Broadcast to channel subscribers
  const channel = activeChannels.get(roomId);
  if (channel) {
    await channel.send({
      type: 'broadcast',
      event: 'agent_message',
      payload: { ...data, room_id: roomId, content, sender_agent_id: opts.agentId, idempotency_key: idempotencyKey },
    });
  }

  return { messageId: data.id };
}

/**
 * Update agent presence in a room.
 */
export async function updatePresence(roomId: string, agentId: string, state: AgentState) {
  await serviceClient.from('apex20_agent_presence').upsert(
    { room_id: roomId, agent_id: agentId, state, last_active_at: new Date().toISOString() },
    { onConflict: 'room_id,agent_id' }
  );

  const channel = activeChannels.get(roomId);
  if (channel) await channel.track({ agent_id: agentId, state });
}

/**
 * Load message history for reconnect recovery — no duplicates.
 */
export async function getMessageHistory(
  roomId: string,
  limit = 50,
  afterSequence?: number
): Promise<AgentMessage[]> {
  let query = serviceClient
    .from('apex20_agent_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('sequence_number', { ascending: true })
    .limit(limit);

  if (afterSequence) query = query.gt('sequence_number', afterSequence);

  const { data } = await query;
  return (data ?? []) as AgentMessage[];
}
