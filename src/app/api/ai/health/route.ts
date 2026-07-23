import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai-gateway/client';

export async function GET() {
  try {
    const ping = await chat([{ role: 'user', content: 'ping' }], {
      model: 'openai/gpt-4o-mini',
      max_tokens: 5,
      timeout_ms: 15000,
    });

    return NextResponse.json({
      status: 'ok',
      gateway: 'configured',
      ping_response: ping,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI health check failed';
    return NextResponse.json(
      {
        status: 'error',
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
