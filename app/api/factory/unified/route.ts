import { NextResponse } from 'next/server';
import { UnifiedBuildRequestSchema } from '@/src/lib/unified-factory/contracts';
import { createUnifiedBuildPacket } from '@/src/lib/unified-factory/router';
import { createMcpHandoff } from '@/src/lib/unified-factory/mcp-handoff';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'XAB Unified Autonomous Factory',
    schemaVersion: '1.1.0',
    mode: 'preview_only',
    dispatchEnabled: false,
    primaryOperatingMcp: {
      name: 'Xtreme AI Builder MCP',
      namespace: 'Xtreme_AI_Builder',
      pluginId: 'dev-6a633e9ec62c8191aec60a9799309021',
      connectorState: 'namespace_recognized_tool_schema_not_exposed',
    },
    compatibilityExecutor: {
      name: 'AUTO BUILDER 2 MCP',
      authority: 'subordinate',
    },
    qualityTargets: {
      visualParityEachBreakpoint: 99,
      operationalParity: 100,
      browserWorkerRequired: true,
      maxRepairIterations: 5,
    },
    authorityChain: [
      'Operator',
      'GPT Business',
      'Xtreme AI Builder MCP',
      'Base44 APEX',
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
    primaryOperatingMcp: 'Xtreme AI Builder MCP',
    packet,
    mcpHandoff,
    executionNote:
      'This endpoint creates the canonical Xtreme AI Builder MCP work packet. Dispatch stays disabled until the Xtreme_AI_Builder connector exposes and passes its callable tool contract. AUTO BUILDER 2 is subordinate compatibility execution only; production and protected actions remain blocked.',
  });
}
