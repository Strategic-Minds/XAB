import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai-gateway/client';

export async function GET() {
  try {
    const ping = await chat([{ role: 'user', content: 'ping' }], {
      model: 'openai/gpt-4o-mini', maxTokens: 5
    });
    return NextResponse.json({
      status: 'ok',
      gateway: 'vercel-ai-gateway',
      endpoint: 'https://ai-gateway.vercel.sh/v1',
      ping_response: ping,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: String(err) }, { status: 503 });
  }
}