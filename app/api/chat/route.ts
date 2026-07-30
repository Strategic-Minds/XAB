/**
 * XAB Chat Route — Agent-aware streaming chat
 * Loads agent from Supabase by agentId, uses their system prompt + capability tools.
 * Default: XAB Master Orchestrator (AGT-501619f2)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { convertToCoreMessages } from 'ai';
import { executeAgentTurn } from '@/lib/swarm/agent-executor';
import { checkRateLimit, getUserIdentifier } from '@/lib/security/rate-limit';
export const dynamic = 'force-dynamic';

// Chat rate limit: 20 req/min per user (LLM cost protection)
const CHAT_RATE_LIMIT = 20;
const CHAT_RATE_WINDOW = 60 * 1000;

const DEFAULT_AGENT_ID = 'AGT-501619f2'; // XAB Master Orchestrator

export async function POST(req: NextRequest) {
  // Rate limit — prevent LLM cost abuse
  const identifier = getUserIdentifier(req);
  const rl = checkRateLimit(identifier, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 20 messages per minute.', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

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
