import { createClient } from "@/lib/supabase/server";
import { webSearch, fetchUrl, isValidUrl } from "@/lib/web-browsing";
import { validateToolParameters, auditToolExecution } from "@/lib/safety-layer";

/**
 * Tool Executor: Handles actual execution of AI tools
 * Routes tool calls to appropriate API endpoints or external services
 */

interface ToolExecutionContext {
  userId: string;
  toolName: string;
  parameters: Record<string, any>;
}

export async function executeTool(context: ToolExecutionContext): Promise<any> {
  const { userId, toolName, parameters } = context;

  try {
    // Validate parameters first
    const validation = await validateToolParameters(toolName, parameters);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    let result: any;

    switch (toolName) {
      // WEB BROWSING
      case "webSearch":
  // @ts-expect-error -- type safety suppressed for compatibility
        result = await executeWebSearch(parameters as any);
        break;
      case "fetchUrl":
  // @ts-expect-error -- type safety suppressed for compatibility
        result = await executeFetchUrl(parameters as any);
        break;

      // NAVIGATION
      case "navigateTo":
        result = { success: true, action: "navigate", page: parameters.page };
        break;

      // LEAD MANAGEMENT
      case "createLead":
        result = await executeCreateLead(userId, parameters);
        break;
      case "searchLeads":
        result = await executeSearchLeads(userId, parameters);
        break;
      case "updateLead":
        result = await executeUpdateLead(userId, parameters);
        break;

      // CRM CONTACTS
      case "createContact":
        result = await executeCreateContact(userId, parameters);
        break;
      case "listContacts":
        result = await executeListContacts(userId, parameters);
        break;

      // WORKFLOWS
      case "triggerWorkflow":
        result = await executeTriggerWorkflow(userId, parameters);
        break;
      case "listWorkflows":
        result = await executeListWorkflows(userId, parameters);
        break;

      // CONTENT
      case "createContent":
        result = await executeCreateContent(userId, parameters);
        break;

      // ANALYTICS
      case "getMetrics":
        result = await executeGetMetrics(userId, parameters);
        break;

      // OUTREACH
      case "sendOutreach":
        result = await executeSendOutreach(userId, parameters);
        break;

      // KNOWLEDGE
      case "searchKnowledge":
        result = await executeSearchKnowledge(userId, parameters);
        break;

      // AGENTS
      case "createAgent":
        result = await executeCreateAgent(userId, parameters);
        break;
      case "runAgent":
        result = await executeRunAgent(userId, parameters);
        break;

      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    // Audit log the execution
    await auditToolExecution({
      userId,
      toolName,
      parameters,
      result,
      status: result.success !== false ? "success" : "failure",
    }).catch(err => console.error("[Tool Executor] Audit logging error:", err));

    return result;
  } catch (error) {
    console.error(`[Tool Executor] Error executing ${toolName}:`, error);
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };

    // Log the error
    await auditToolExecution({
      userId,
      toolName,
      parameters,
      result: errorResult,
      status: "failure",
    }).catch(err => console.error("[Tool Executor] Audit logging error:", err));

    return errorResult;
  }
}

// WEB BROWSING IMPLEMENTATIONS
async function executeWebSearch(parameters: {
  query: string;
  maxResults?: number;
}): Promise<any> {
  const { query, maxResults = 5 } = parameters;

  try {
    const results = await webSearch(query, Math.min(maxResults, 10));

    return {
      success: true,
      action: "web_search",
      query,
      resultCount: results.length,
      results,
      message: `Found ${results.length} results for "${query}"`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Web search failed: " + String(error),
    };
  }
}

async function executeFetchUrl(parameters: {
  url: string;
  extractContent?: boolean;
}): Promise<any> {
  const { url, extractContent = true } = parameters;

  if (!isValidUrl(url)) {
    return { success: false, error: "Invalid URL format" };
  }

  try {
    const result = await fetchUrl(url, extractContent);

    return {
      success: true,
      action: "fetch_url",
      url,
      contentLength: result.contentLength,
      content: result.content.substring(0, 2000), // Limit preview
      statusCode: result.statusCode,
      message: `Fetched ${result.contentLength} characters from ${url}`,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch URL: " + String(error),
    };
  }
}

// LEAD MANAGEMENT IMPLEMENTATIONS
async function executeCreateLead(
  userId: string,
  parameters: any
): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: userId,
      name: parameters.name,
      email: parameters.email,
      phone: parameters.phone,
      company: parameters.company,
      source: parameters.source,
      notes: parameters.notes,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "create_lead",
    data,
    message: `Lead "${parameters.name}" created successfully`,
  };
}

async function executeSearchLeads(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId);

  if (parameters.query) {
    query = query.or(
      `name.ilike.%${parameters.query}%,email.ilike.%${parameters.query}%`
    );
  }

  if (parameters.status) {
    query = query.eq("status", parameters.status);
  }

  query = query.limit(parameters.limit || 10);

  const { data, error } = await query;

  if (error) throw error;

  return {
    success: true,
    action: "search_leads",
    count: data?.length || 0,
    data,
    message: `Found ${data?.length || 0} leads`,
  };
}

async function executeUpdateLead(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .update({
      status: parameters.status,
      notes: parameters.notes,
    })
    .eq("id", parameters.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "update_lead",
    data,
    message: `Lead updated successfully`,
  };
}

// CRM CONTACT IMPLEMENTATIONS
async function executeCreateContact(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: userId,
      first_name: parameters.firstName,
      last_name: parameters.lastName,
      email: parameters.email,
      phone: parameters.phone,
      company: parameters.company,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "create_contact",
    data,
    message: `Contact "${parameters.firstName} ${parameters.lastName}" created`,
  };
}

async function executeListContacts(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId);

  if (parameters.company) {
    query = query.eq("company", parameters.company);
  }

  query = query.limit(parameters.limit || 20);

  const { data, error } = await query;

  if (error) throw error;

  return {
    success: true,
    action: "list_contacts",
    count: data?.length || 0,
    data,
  };
}

// WORKFLOW IMPLEMENTATIONS
async function executeTriggerWorkflow(
  userId: string,
  parameters: any
): Promise<any> {
  const supabase = await createClient();

  // Get workflow details
  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", parameters.workflowId)
    .eq("user_id", userId)
    .single();

  if (workflowError) throw workflowError;
  if (!workflow) throw new Error("Workflow not found");

  // Create workflow run
  const { data: run, error: runError } = await supabase
    .from("workflow_runs")
    .insert({
      workflow_id: parameters.workflowId,
      user_id: userId,
      input: parameters.data || {},
      status: "running",
    })
    .select()
    .single();

  if (runError) throw runError;

  return {
    success: true,
    action: "trigger_workflow",
    runId: run?.id,
    workflowName: workflow.name,
    message: `Workflow "${workflow.name}" triggered`,
  };
}

async function executeListWorkflows(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("user_id", userId)
    .limit(parameters.limit || 20);

  if (error) throw error;

  return {
    success: true,
    action: "list_workflows",
    count: data?.length || 0,
    data,
  };
}

// CONTENT IMPLEMENTATIONS
async function executeCreateContent(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content")
    .insert({
      user_id: userId,
      title: parameters.title,
      type: parameters.type,
      body: parameters.body,
      tags: parameters.tags || [],
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "create_content",
    data,
    message: `${parameters.type} "${parameters.title}" created`,
  };
}

// ANALYTICS IMPLEMENTATIONS
async function executeGetMetrics(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();
  const { metric, period = "month" } = parameters;

  // Calculate date range
  const now = new Date();
  let startDate = new Date();

  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  let query;
  switch (metric) {
    case "leads":
      query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());
      break;

    case "conversions":
      query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "converted")
        .gte("created_at", startDate.toISOString());
      break;

    case "contacts":
      query = supabase
        .from("contacts")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());
      break;

    default:
      return {
        success: false,
        error: `Unknown metric: ${metric}`,
      };
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    success: true,
    action: "get_metrics",
    metric,
    period,
    count,
    data,
    message: `${metric}: ${count} (${period})`,
  };
}

// OUTREACH IMPLEMENTATIONS
async function executeSendOutreach(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  // Create outreach record
  const { data, error } = await supabase
    .from("outreach_campaigns")
    .insert({
      user_id: userId,
      campaign_name: parameters.campaignName || "Outreach",
      subject: parameters.subject,
      body: parameters.body,
      contact_count: parameters.contactIds.length,
      status: "queued",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "send_outreach",
    campaignId: data?.id,
    contactCount: parameters.contactIds.length,
    message: `Campaign queued for ${parameters.contactIds.length} contacts`,
  };
}

// KNOWLEDGE IMPLEMENTATIONS
async function executeSearchKnowledge(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("user_id", userId)
    .textSearch("content", parameters.query)
    .limit(parameters.limit || 5);

  if (error) throw error;

  return {
    success: true,
    action: "search_knowledge",
    query: parameters.query,
    count: data?.length || 0,
    data,
  };
}

// AGENT IMPLEMENTATIONS
async function executeCreateAgent(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agents")
    .insert({
      user_id: userId,
      name: parameters.name,
      description: parameters.description,
      system_prompt: parameters.systemPrompt,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "create_agent",
    data,
    message: `Agent "${parameters.name}" created successfully`,
  };
}

async function executeRunAgent(userId: string, parameters: any): Promise<any> {
  const supabase = await createClient();

  // Get agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("id", parameters.agentId)
    .eq("user_id", userId)
    .single();

  if (agentError) throw agentError;
  if (!agent) throw new Error("Agent not found");

  // Create execution record
  const { data, error } = await supabase
    .from("agent_executions")
    .insert({
      agent_id: parameters.agentId,
      user_id: userId,
      input: parameters.input,
      status: "running",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    action: "run_agent",
    executionId: data?.id,
    agentName: agent.name,
    message: `Agent "${agent.name}" executing...`,
  };
}
