// XAB MCP — Core type definitions
// Namespace map: xab.control | xab.build | xab.data | xab.chat | xab.intel | xab.finance | xab.validation | xab.release | xab.admin | xab.xps | legacy.autobuilder

export type McpNamespace =
  | 'xab.control' | 'xab.build' | 'xab.data' | 'xab.chat'
  | 'xab.intel' | 'xab.finance' | 'xab.validation' | 'xab.release'
  | 'xab.admin' | 'xab.xps' | 'legacy.autobuilder';

export type RiskClass = 'low' | 'medium' | 'high' | 'critical' | 'blocked';
export type ApprovalRequirement = 'none' | 'conditional' | 'operator' | 'never';
export type ReceiptRequirement = 'trace' | 'yes' | 'required';

export interface McpToolDefinition {
  id: string;              // e.g. T-001
  namespace: McpNamespace;
  name: string;            // e.g. project.get
  mode: 'read' | 'draft' | 'write' | 'protected' | 'blocked';
  purpose: string;
  risk: RiskClass;
  approval: ApprovalRequirement;
  receipt: ReceiptRequirement;
  rollback?: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  scopes: string[];
  timeoutMs: number;
  budgetPolicy?: Record<string, unknown>;
}

export interface McpSession {
  sessionId: string;
  clientType: 'base44' | 'gpt' | 'ui';
  actorId: string;
  projectId?: string;
  workflowRunId?: string;
  openedAt: string;
  lastSeenAt: string;
}

export interface McpToolCall {
  toolCallId: string;
  sessionId: string;
  tool: string;
  namespace: McpNamespace;
  input: Record<string, unknown>;
  traceId: string;
  requestedAt: string;
}

export interface McpReceipt {
  receiptId: string;
  toolCallId: string;
  result: 'success' | 'failure' | 'approval_required' | 'blocked';
  output?: Record<string, unknown>;
  error?: string;
  rollbackRef?: string;
  completedAt: string;
}

export interface McpApprovalRequest {
  approvalId: string;
  toolCallId: string;
  action: string;
  scope: Record<string, unknown>;
  risk: RiskClass;
  requestedBy: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}
