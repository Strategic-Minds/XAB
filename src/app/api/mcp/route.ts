import { NextRequest, NextResponse } from 'next/server';
import { evaluateToolPolicy, auditToolCall, type PolicyContext } from '@/lib/mcp/policy-engine';
import { getTool, XAB_TOOLS } from '@/lib/mcp/tool-registry';

// XAB MCP Gateway — Streamable HTTP entry point
// Implements MCP-001 through MCP-014 from workbook spec
// OAuth 2.1 validation is handled by middleware (not inline here)

const ALLOWED_ORIGINS = [
  'https://app.base44.com',
  'https://chat.openai.com',
  'https://chatgpt.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: NextRequest) {
  // Capability discovery endpoint
  const origin = req.headers.get('origin');
  return NextResponse.json({
    protocolVersion: '2024-11-05',
    serverInfo: { name: 'xab-mcp-gateway', version: '1.0.0' },
    capabilities: { tools: { listChanged: true }, resources: {}, prompts: {} },
    tools: XAB_TOOLS.map(t => ({
      name: t.name,
      description: t.purpose,
      inputSchema: t.inputSchema,
    })),
  }, { headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const sessionId = req.headers.get('mcp-session-id') ?? 'anonymous';
  const authHeader = req.headers.get('authorization') ?? '';

  // Token validation placeholder — full OAuth 2.1 in Wave 3
  // For now: require Bearer token to be present
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'unauthorized', message: 'Bearer token required' },
      { status: 401, headers: corsHeaders(origin) }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const { method, params } = body as { method?: string; params?: Record<string, unknown> };

  if (!method) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'method is required' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Handle MCP protocol methods
  if (method === 'initialize') {
    return NextResponse.json({
      protocolVersion: '2024-11-05',
      capabilities: { tools: { listChanged: true } },
      serverInfo: { name: 'xab-mcp-gateway', version: '1.0.0' },
    }, { headers: corsHeaders(origin) });
  }

  if (method === 'tools/list') {
    return NextResponse.json({
      tools: XAB_TOOLS.map(t => ({
        name: t.name,
        description: t.purpose,
        inputSchema: t.inputSchema,
      })),
    }, { headers: corsHeaders(origin) });
  }

  if (method === 'tools/call') {
    const toolName = (params as Record<string, unknown>)?.name as string;
    const toolInput = (params as Record<string, unknown>)?.arguments as Record<string, unknown>;

    if (!toolName) {
      return NextResponse.json(
        { error: 'invalid_params', message: 'Tool name required' },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const tool = getTool(toolName);
    if (!tool) {
      return NextResponse.json(
        { error: 'tool_not_found', message: `Tool '${toolName}' not in XAB registry` },
        { status: 404, headers: corsHeaders(origin) }
      );
    }

    // Determine client type from token (simplified for Wave 2 — full OAuth in Wave 3)
    const clientType: 'base44' | 'gpt' | 'ui' =
      authHeader.includes('b44') ? 'base44' :
      authHeader.includes('gpt') ? 'gpt' : 'ui';

    const session = {
      sessionId,
      clientType,
      actorId: 'pending-oauth', // full identity in Wave 3
      openedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    const policyCtx: PolicyContext = {
      session,
      clientScopes: tool.scopes, // Wave 3: derive from validated JWT
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
    };

    const decision = evaluateToolPolicy(toolName, policyCtx);
    auditToolCall(tool, decision, session);

    if (!decision.allowed) {
      return NextResponse.json(
        { error: 'policy_denied', message: decision.reason, code: decision.code },
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    if (decision.requiresApproval) {
      return NextResponse.json(
        { requiresApproval: true, message: decision.reason, tool: toolName },
        { status: 202, headers: corsHeaders(origin) }
      );
    }

    // Tool execution stub — Wave 4 wires real handlers per namespace
    return NextResponse.json({
      content: [{ type: 'text', text: `[XAB:${tool.namespace}:${tool.name}] Registered. Full implementation in Wave 4.` }],
      _meta: { tool: toolName, namespace: tool.namespace, traceId: crypto.randomUUID() },
    }, { headers: corsHeaders(origin) });
  }

  return NextResponse.json(
    { error: 'method_not_found', message: `Unknown method: ${method}` },
    { status: 404, headers: corsHeaders(origin) }
  );
}
