import { NextResponse } from 'next/server';
import { UnifiedBuildRequestSchema } from '@/src/lib/unified-factory/contracts';
import { createUnifiedBuildPacket } from '@/src/lib/unified-factory/router';
import { createMcpHandoff } from '@/src/lib/unified-factory/mcp-handoff';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = UnifiedBuildRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'INVALID_BUILD_REQUEST',
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const packet = createUnifiedBuildPacket(parsed.data);
  const mcpHandoff = createMcpHandoff(packet);

  return NextResponse.json({
    ok: true,
    status: parsed.data.execute ? 'APPROVAL_GATED_HANDOFF_READY' : 'DRY_RUN_PACKET_READY',
    dispatchEnabled: false,
    primaryOperatingMcp: 'Xtreme AI Builder MCP',
    packet,
    mcpHandoff,
    executionNote:
      'This endpoint creates the canonical Xtreme AI Builder MCP work packet. Dispatch stays disabled until the Xtreme_AI_Builder connector exposes and passes its callable tool contract. AUTO BUILDER 2 is subordinate compatibility execution only; production and protected actions remain blocked.',
  });
}
