import { createClient } from "@/lib/supabase/server";

/**
 * Safety Layer: Handles user confirmations and permission checks
 * Prevents accidental destructive operations
 */

interface ToolPermissionRequest {
  userId: string;
  toolName: string;
  parameters: Record<string, any>;
  action: "create" | "update" | "delete" | "execute";
}

interface PermissionCheckResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  message?: string;
}

// Tools that require explicit user confirmation
const DANGEROUS_TOOLS = new Set([
  "updateLead",
  "sendOutreach",
  "triggerWorkflow",
  "deleteAgent",
  "runAgent",
]);

// Tools that should log all operations for audit
const AUDIT_TOOLS = new Set([
  "createLead",
  "updateLead",
  "sendOutreach",
  "triggerWorkflow",
  "createAgent",
  "runAgent",
]);

/**
 * Check if a tool call requires user confirmation
 */
export async function checkToolPermission(
  request: ToolPermissionRequest
): Promise<PermissionCheckResult> {
  const { userId, toolName, parameters } = request;

  // Check basic permission
  if (!userId) {
    return {
      allowed: false,
      requiresConfirmation: false,
      message: "Not authenticated",
    };
  }

  // Check if tool requires confirmation
  if (DANGEROUS_TOOLS.has(toolName)) {
    return {
      allowed: true,
      requiresConfirmation: true,
      message: `Please confirm: You&apos;re about to ${getActionDescription(toolName, parameters)}`,
    };
  }

  return {
    allowed: true,
    requiresConfirmation: false,
  };
}

/**
 * Log tool execution for audit trail
 */
export async function auditToolExecution(context: {
  userId: string;
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: "success" | "failure";
}): Promise<void> {
  const supabase = await createClient();

  if (!AUDIT_TOOLS.has(context.toolName)) {
    return; // Skip non-audit tools
  }

  try {
    await supabase.from("audit_logs").insert({
      user_id: context.userId,
      tool_name: context.toolName,
      parameters: context.parameters,
      result: context.result,
      status: context.status,
      timestamp: new Date().toISOString(),
      ip_address: null, // Could be extracted from request if needed
    });
  } catch (error) {
    console.error("[Safety] Error logging audit trail:", error);
  }
}

/**
 * Get a human-readable description of what the tool will do
 */
function getActionDescription(
  toolName: string,
  parameters: Record<string, any>
): string {
  switch (toolName) {
    case "updateLead":
      return `update lead "${parameters.id}" status to "${parameters.status}"`;

    case "sendOutreach":
      return `send emails to ${parameters.contactIds?.length || 0} contacts with subject "${parameters.subject}"`;

    case "triggerWorkflow":
      return `execute workflow "${parameters.workflowId}"`;

    case "runAgent":
      return `run agent "${parameters.agentId}" with input: "${parameters.input?.substring(0, 50)}..."`;

    case "deleteAgent":
      return `delete agent "${parameters.agentId}"`;

    default:
      return `execute ${toolName}`;
  }
}

/**
 * Rate limiting check for tool execution
 */
export async function checkRateLimit(
  userId: string,
  toolName: string,
  timeWindowMinutes: number = 5
): Promise<boolean> {
  const supabase = await createClient();

  const cutoffTime = new Date(
    Date.now() - timeWindowMinutes * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("tool_executions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("tool_name", toolName)
    .gte("created_at", cutoffTime);

  if (error) {
    console.error("[Safety] Rate limit check error:", error);
    return true; // Allow on error
  }

  const count = data?.length || 0;

  // Different limits for different tools
  const limits: Record<string, number> = {
    sendOutreach: 10, // Max 10 outreach per 5 minutes
    triggerWorkflow: 20, // Max 20 workflows per 5 minutes
    createAgent: 5, // Max 5 agents per 5 minutes
    default: 50, // Default limit
  };

  const limit = limits[toolName] || limits.default;
  return count < limit;
}

/**
 * Generate confirmation prompt for user
 */
export function generateConfirmationPrompt(
  toolName: string,
  parameters: Record<string, any>
): string {
  const action = getActionDescription(toolName, parameters);

  return `**Confirmation Required**

You&apos;re about to ${action}.

This action cannot be easily undone. Please confirm you want to proceed.

**Yes** - Execute this action
**No** - Cancel`;
}

/**
 * Validate tool parameters before execution
 */
export async function validateToolParameters(
  toolName: string,
  parameters: Record<string, any>
): Promise<{ valid: boolean; error?: string }> {
  switch (toolName) {
    case "createLead":
      if (!parameters.name || !parameters.email) {
        return {
          valid: false,
          error: "Lead must have name and email",
        };
      }
      if (!parameters.email.includes("@")) {
        return { valid: false, error: "Invalid email address" };
      }
      break;

    case "createContact":
      if (!parameters.firstName || !parameters.lastName) {
        return {
          valid: false,
          error: "Contact must have first and last name",
        };
      }
      break;

    case "sendOutreach":
      if (!parameters.contactIds || parameters.contactIds.length === 0) {
        return { valid: false, error: "No contacts specified" };
      }
      if (!parameters.subject || !parameters.body) {
        return { valid: false, error: "Email must have subject and body" };
      }
      if (parameters.body.length < 10) {
        return { valid: false, error: "Email body too short" };
      }
      break;

    case "updateLead":
      if (!parameters.id) {
        return { valid: false, error: "Lead ID required" };
      }
      break;

    case "triggerWorkflow":
      if (!parameters.workflowId) {
        return { valid: false, error: "Workflow ID required" };
      }
      break;

    case "createAgent":
      if (!parameters.name || !parameters.systemPrompt) {
        return {
          valid: false,
          error: "Agent must have name and system prompt",
        };
      }
      break;
  }

  return { valid: true };
}
