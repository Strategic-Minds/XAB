import { NextResponse } from 'next/server';
import { UnifiedBuildRequestSchema } from '@/src/lib/unified-factory/contracts';
import { createUnifiedBuildPacket } from '@/src/lib/unified-factory/router';
import { createMcpHandoff } from '@/src/lib/unified-factory/mcp-handoff';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'XAB Unified Autonomous Factory',
    schemaVersion: '1.0.0',
    mode: 'preview_only',
    dispatchEnabled: false,
    qualityTargets: {
      visualParityEachBreakpoint: 99,
      operationalParity: 100,
      browserWorkerRequired: true,
      maxRepairIterations: 5,
    },
    authorityChain: [
      'XAB',
      'GPT Business',
      'Base44 APEX',
      'AUTO BUILDER 2 MCP',
      'UACS Sandbox',
      'BrowserWorker',
      'Operator Release Gate',
    ],
    protectedActions: 'blocked_without_explicit_operator_approval',
  });
}

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
    packet,
    mcpHandoff,
    executionNote:
      'This endpoint creates the canonical packet and AUTO BUILDER MCP handoff. A separately validated MCP transport adapter must submit it; production and protected actions remain blocked.',
  });
}
