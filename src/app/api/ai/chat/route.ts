import { NextRequest, NextResponse } from 'next/server';
import { chat, chatStream, modelFor, type ChatMessage } from '@/lib/ai-gateway/client';

/**
 * XAB Chat API — powered by Vercel AI Gateway
 * POST /api/ai/chat
 * Supports streaming and non-streaming.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stream = false, task = 'chat', model } = body as {
      messages: ChatMessage[];
      stream?: boolean;
      task?: string;
      model?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const selectedModel = model ?? modelFor(task as Parameters<typeof modelFor>[0]);

    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const token of chatStream(messages, { model: selectedModel })) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const response = await chat(messages, { model: selectedModel });
    return NextResponse.json({ response, model: selectedModel });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}