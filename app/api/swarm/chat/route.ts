/**
 * XAB Swarm Chat Route
 * Accepts a message + agentId, streams response from that agent.
 * Writes to xab_agent_messages table for the chat UI.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { convertToCoreMessages } from 'ai';
import { executeAgentTurn } from '@/lib/swarm/agent-executor';
import { detectAgentMentions, dispatchToAgent } from '@/lib/swarm/swarm-dispatcher';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, agentId = 'AGT-501619f2', conversationId } = body;

    if (!messages?.length) return NextResponse.json({ error: 'messages required' }, { status: 400 });

    const supabase = await createClient();
    const coreMessages = convertToCoreMessages(messages);

    // Run the requested agent
    const result = await executeAgentTurn(agentId, coreMessages, supabase, conversationId);
    return result.toDataStreamResponse();
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Return all agents for the chat UI to populate the roster
  const supabase = await createClient();
  const { data } = await supabase
    .from('xab_agents')
    .select('agent_id,name,handle,avatar_color,avatar_emoji,tagline,status,autonomy_level,can_browse,can_generate_code,can_deploy,can_send_messages,last_active_at,total_messages')
    .eq('status', 'active')
    .order('name');
  return NextResponse.json(data ?? []);
}