import { NextResponse } from 'next/server';
import { UnifiedBuildRequestSchema } from '@/src/lib/unified-factory/contracts';
import { createUnifiedBuildPacket } from '@/src/lib/unified-factory/router';
import { createMcpHandoff } from '@/src/lib/unified-factory/mcp-handoff';

export const runtime = 'nodejs';

function dispatchConfiguration() {
  const url = process.env.AUTO_BUILDER_UNIVERSAL_JOB_URL?.trim() || '';
  const token = process.env.AUTO_BUILDER_BRIDGE_TOKEN?.trim() || process.env.CRON_SECRET?.trim() || '';
  return { url, token, configured: Boolean(url && token) };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON', productionMutation: false }, { status: 400 });
  }

  const parsed = UnifiedBuildRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'INVALID_BUILD_REQUEST', issues: parsed.error.flatten(), productionMutation: false },
      { status: 422 },
    );
  }

  const packet = createUnifiedBuildPacket(parsed.data);
  const mcpHandoff = createMcpHandoff(packet);

  if (!parsed.data.execute) {
    return NextResponse.json({
      ok: true,
      status: 'DRY_RUN_PACKET_READY',
      dispatchEnabled: false,
      primaryOperatingMcp: 'Xtreme AI Builder MCP',
      packet,
      mcpHandoff,
      productionMutation: false,
    });
  }

  const dispatch = dispatchConfiguration();
  if (!dispatch.configured) {
    return NextResponse.json({
      ok: false,
      status: 'BLOCKED_DISPATCH_CONFIGURATION',
      error: 'AUTO_BUILDER_UNIVERSAL_JOB_URL and a server-side bridge credential are required.',
      packet,
      mcpHandoff,
      productionMutation: false,
    }, { status: 503 });
  }

  const requestId = `xab-${crypto.randomUUID()}`;
  const response = await fetch(dispatch.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dispatch.token}`,
      'Content-Type': 'application/json',
      'x-service-id': 'xab-command-center',
      'x-request-id': requestId,
      'x-correlation-id': packet.correlationId,
      'x-idempotency-key': `${packet.projectId}:${packet.correlationId}`,
    },
    body: JSON.stringify(mcpHandoff),
    cache: 'no-store',
    signal: AbortSignal.timeout(55_000),
  });

  const raw = await response.text();
  let providerResult: unknown = raw;
  try { providerResult = raw ? JSON.parse(raw) : null; } catch { /* retain redacted text */ }

  return NextResponse.json({
    ok: response.ok,
    status: response.ok ? 'DISPATCHED_TO_GOVERNED_EXECUTOR' : 'EXECUTOR_REJECTED_HANDOFF',
    requestId,
    primaryOperatingMcp: 'Xtreme AI Builder MCP',
    executor: 'AUTOBUILDER-V2',
    packet,
    providerResult,
    productionMutation: false,
  }, { status: response.status });
}
