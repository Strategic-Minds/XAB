import { NextRequest, NextResponse } from 'next/server';
import { embed } from '@/lib/ai-gateway/client';

/**
 * XAB Embedding API — powered by Vercel AI Gateway
 * POST /api/ai/embed
 * { text: string | string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });
    const vectors = await embed(text);
    return NextResponse.json({ vectors, model: 'openai/text-embedding-3-small', dimensions: 1536 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}