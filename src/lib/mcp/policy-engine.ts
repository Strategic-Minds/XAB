import type { McpToolDefinition, McpSession, RiskClass } from './types';
import { getTool, isBlocked, requiresOperatorApproval } from './tool-registry';

export type PolicyDecision =
  | { allowed: true; requiresApproval: false }
  | { allowed: true; requiresApproval: true; reason: string }
  | { allowed: false; reason: string; code: 'BLOCKED' | 'PROTECTED' | 'SCOPE_DENIED' | 'BUDGET_EXCEEDED' };

export interface PolicyContext {
  session: McpSession;
  clientScopes: string[];
  environment: 'development' | 'preview' | 'production';
  budgetRemaining?: number;
}

export function evaluateToolPolicy(
  toolName: string,
  ctx: PolicyContext
): PolicyDecision {
  const tool = getTool(toolName);

  if (!tool) {
    return { allowed: false, reason: `Tool '${toolName}' not found in XAB registry`, code: 'BLOCKED' };
  }

  // Blocked tools never execute
  if (isBlocked(tool)) {
    return { allowed: false, reason: `Tool '${tool.name}' is permanently blocked in XAB: ${tool.purpose}`, code: 'BLOCKED' };
  }

  // Scope check
  const hasScopes = tool.scopes.every(s => ctx.clientScopes.includes(s));
  if (!hasScopes) {
    return { allowed: false, reason: `Client lacks required scopes: ${tool.scopes.join(', ')}`, code: 'SCOPE_DENIED' };
  }

  // Operator approval required
  if (requiresOperatorApproval(tool)) {
    return { allowed: true, requiresApproval: true, reason: `Tool '${tool.name}' requires explicit operator approval (risk: ${tool.risk})` };
  }

  // High-risk tools in production require conditional approval
  if (tool.risk === 'high' && ctx.environment === 'production') {
    return { allowed: true, requiresApproval: true, reason: `High-risk tool '${tool.name}' in production requires approval` };
  }

  return { allowed: true, requiresApproval: false };
}

export function auditToolCall(tool: McpToolDefinition, decision: PolicyDecision, session: McpSession): void {
  // Structured audit log — never log raw secrets or bearer tokens
  const entry = {
    timestamp: new Date().toISOString(),
    tool: tool.name,
    namespace: tool.namespace,
    risk: tool.risk,
    session_id: session.sessionId,
    actor_id: session.actorId,
    client_type: session.clientType,
    decision: decision.allowed ? 'allowed' : 'denied',
    requires_approval: decision.allowed && decision.requiresApproval ? true : false,
  };
  // In production, this feeds into OpenTelemetry / security_events table
  console.log('[XAB:MCP:POLICY]', JSON.stringify(entry));
}
