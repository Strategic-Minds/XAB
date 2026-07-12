import { NextRequest, NextResponse } from 'next/server';
import { callMCPTool, MCPCallResult } from '@/lib/mcp/gateway';
import { MCP_TOOLS, NAMESPACES } from '@/lib/mcp/registry';

export async function GET() {
  return NextResponse.json({
    system: 'XAB MCP Gateway',
    company: 'Strategic Minds AI LLC',
    domain: 'xps-intelligence.com',
    tools: MCP_TOOLS.length,
    namespaces: NAMESPACES,
    version: '1.0.0',
  });
}

export async function POST(req: NextRequest) {
  try {
    const { tool, input = {}, caller_role = 'agent' } = await req.json();
    if (!tool) return NextResponse.json({ error: 'tool required' }, { status: 400 });
    const result: MCPCallResult = await callMCPTool(tool, input, caller_role);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
