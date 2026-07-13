/**
 * XAB Chat Route — Agent-aware streaming chat
 * Loads agent from Supabase by agentId, uses their system prompt + capability tools.
 * Default: XAB Master Orchestrator (AGT-501619f2)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { convertToCoreMessages } from 'ai';
import { executeAgentTurn } from '@/lib/swarm/agent-executor';
export const dynamic = 'force-dynamic';

const DEFAULT_AGENT_ID = 'AGT-501619f2'; // XAB Master Orchestrator

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, agentId, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const supabase = await createClient();
    const targetAgentId = agentId || DEFAULT_AGENT_ID;
    const coreMessages = convertToCoreMessages(messages);

    const result = await executeAgentTurn(targetAgentId, coreMessages, supabase, conversationId);
    return result.toDataStreamResponse();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[XAB Chat]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}