import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Simple rate limiter
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.reset < now) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in 1 minute.' }, { status: 429 });
    }

    const body = await req.json() as Record<string, unknown>;

    // Normalize input from ChatGPT, WhatsApp, or raw JSON
    let command = '';
    if (typeof body.command === 'string') command = body.command;
    else if (typeof body.message === 'string') command = body.message;
    else if (typeof body.Body === 'string') command = body.Body; // Twilio WhatsApp

    if (!command.trim()) {
      return NextResponse.json({ error: 'No command found. Send: {"command": "Create an epoxy contractor website in West Palm Beach, FL"}' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://xab-system.vercel.app';

    // Step 1: Parse the command
    const parseRes = await fetch(`${baseUrl}/api/pipeline/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (!parseRes.ok) throw new Error(`Parse failed: ${await parseRes.text()}`);
    const { parsed } = await parseRes.json() as { parsed: Record<string, unknown> };

    // Step 2: Create project record
    const createRes = await fetch(`${baseUrl}/api/pipeline/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parsed }),
    });
    if (!createRes.ok) throw new Error(`Create failed: ${await createRes.text()}`);
    const { project_id } = await createRes.json() as { project_id: string };

    // Step 3: Trigger image generation (fire and forget)
    fetch(`${baseUrl}/api/pipeline/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id, image_prompt: parsed.image_prompt, parsed }),
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      project_id,
      business_name: parsed.business_name,
      location: parsed.location,
      niche: parsed.niche,
      status: 'pending_image',
      message: `✅ Pipeline started for "${parsed.business_name}" in ${parsed.location}. A hero image is being generated for your approval. You'll receive an email at jeremy@strategicmindsai.com shortly.`,
      track_url: `${baseUrl}/api/pipeline/status?project_id=${project_id}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook failed';
    console.error('[pipeline/webhook]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'XAB AutoBuilder Pipeline Webhook',
    usage: 'POST {"command": "Create an epoxy contractor website in West Palm Beach, FL"}',
    version: '1.0.0',
  });
}
