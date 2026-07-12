import { MCP_TOOLS, getTool, PROTECTED_TOOLS } from './registry';
import { chat, modelFor } from '@/lib/ai-gateway/client';

export interface MCPCallResult {
  tool_id: string;
  tool_name: string;
  status: 'ok' | 'blocked' | 'error';
  result?: unknown;
  error?: string;
  blocked_reason?: string;
}

export async function callMCPTool(
  toolIdOrName: string,
  input: Record<string, unknown>,
  callerRole: 'agent' | 'operator' = 'agent'
): Promise<MCPCallResult> {
  const tool = getTool(toolIdOrName);
  if (!tool) {
    return { tool_id: toolIdOrName, tool_name: toolIdOrName, status: 'error', error: 'Tool not found in registry' };
  }
  
  // Governance check
  if (tool.requiresApproval && callerRole !== 'operator') {
    return {
      tool_id: tool.id, tool_name: tool.name, status: 'blocked',
      blocked_reason: `${tool.name} requires operator approval. Send exact phrase to unblock.`
    };
  }
  
  // Route to handler
  try {
    const result = await routeTool(tool.id, input);
    return { tool_id: tool.id, tool_name: tool.name, status: 'ok', result };
  } catch (err) {
    return { tool_id: tool.id, tool_name: tool.name, status: 'error', error: String(err) };
  }
}

async function routeTool(toolId: string, input: Record<string, unknown>): Promise<unknown> {
  // Stub routing — real implementations added per tool in Wave 3+
  switch (toolId) {
    case 'T-001': return { status: 'ok', system: 'XAB', company: 'Strategic Minds AI LLC', domain: 'xps-intelligence.com', activation_score: 82 };
    case 'T-035': return { tools: MCP_TOOLS.length, namespaces: 11, protected: PROTECTED_TOOLS.length };
    default: {
      // AI-assisted stub response for unimplemented tools
      const resp = await chat(
        [{ role: 'user', content: `Simulate tool ${toolId} with input: ${JSON.stringify(input)}` }],
        { model: modelFor('chat'), systemPrompt: 'You are the XAB MCP gateway. Return a realistic stub response as JSON.' }
      );
      return { stub: true, response: resp };
    }
  }
}
