import { NextResponse } from 'next/server';
import { XAB_TOOLS } from '@/lib/mcp/tool-registry';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'xab-mcp-gateway',
    version: '1.0.0',
    wave: 2,
    tools: { total: XAB_TOOLS.length, namespaces: [...new Set(XAB_TOOLS.map(t => t.namespace))] },
    environment: process.env.NODE_ENV ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
