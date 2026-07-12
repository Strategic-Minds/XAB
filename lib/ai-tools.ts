import { z } from "zod";

/**
 * Simple tool definitions for AI - compatible with AI SDK v7
 */

export const toolDefinitions = {
  webSearch: {
    description: "Search the web for information",
    parameters: z.object({
      query: z.string(),
      maxResults: z.number().default(5),
    }),
  },

  fetchUrl: {
    description: "Fetch content from a URL",
    parameters: z.object({
      url: z.string().url(),
    }),
  },

  navigateTo: {
    description: "Navigate to a site page",
    parameters: z.object({
      page: z.enum([
        "dashboard", "leads", "crm", "analytics", "outreach", "content",
        "workflow-factory", "agent-factory", "knowledge", "projects",
        "research", "funnels", "computer-use", "client-portal", "admin",
        "builder", "chat", "memory", "website-factory",
      ]),
    }),
  },

  createLead: {
    description: "Create a new lead",
    parameters: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }),
  },

  searchLeads: {
    description: "Search for leads",
    parameters: z.object({
      query: z.string().optional(),
      status: z.enum(["new", "contacted", "qualified", "converted"]).optional(),
      limit: z.number().default(10),
    }),
  },

  updateLead: {
    description: "Update a lead",
    parameters: z.object({
      id: z.string(),
      status: z.enum(["new", "contacted", "qualified", "converted"]).optional(),
      notes: z.string().optional(),
    }),
  },

  createContact: {
    description: "Create a CRM contact",
    parameters: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
    }),
  },

  listContacts: {
    description: "List contacts",
    parameters: z.object({
      company: z.string().optional(),
      limit: z.number().default(20),
    }),
  },

  triggerWorkflow: {
    description: "Run a workflow",
    parameters: z.object({
      workflowId: z.string(),
      data: z.record(z.string(), z.any()).optional(),
    }),
  },

  listWorkflows: {
    description: "List workflows",
    parameters: z.object({
      limit: z.number().default(20),
    }),
  },

  createContent: {
    description: "Create content",
    parameters: z.object({
      title: z.string(),
      type: z.enum(["page", "post", "article", "email"]),
      body: z.string(),
      tags: z.array(z.string()).optional(),
    }),
  },

  getMetrics: {
    description: "Get analytics",
    parameters: z.object({
      metric: z.enum(["leads", "conversions", "revenue", "contacts"]),
      period: z.enum(["today", "week", "month", "year"]).optional(),
    }),
  },

  sendOutreach: {
    description: "Send outreach",
    parameters: z.object({
      contactIds: z.array(z.string()),
      subject: z.string(),
      body: z.string(),
      campaignName: z.string().optional(),
    }),
  },

  searchKnowledge: {
    description: "Search knowledge base",
    parameters: z.object({
      query: z.string(),
      limit: z.number().default(5),
    }),
  },

  createAgent: {
    description: "Create an AI agent",
    parameters: z.object({
      name: z.string(),
      description: z.string(),
      systemPrompt: z.string(),
    }),
  },

  runAgent: {
    description: "Run an AI agent",
    parameters: z.object({
      agentId: z.string(),
      input: z.string(),
    }),
  },
};

// Create tool definitions for AI SDK streamText
export const tools = Object.entries(toolDefinitions).reduce(
  (acc, [name, def]: [string, any]) => {
    acc[name] = {
      description: def.description,
      parameters: def.parameters,
    };
    return acc;
  },
  {} as Record<string, any>
);
