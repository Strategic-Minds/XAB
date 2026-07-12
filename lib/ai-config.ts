/**
 * AI Configuration System
 * Customize XAB AI behavior, personality, and capabilities
 * Modify this file to tune how your AI responds and behaves
 */

/**
 * AI Personality & Tone Configuration
 * Control how the AI communicates with users
 */
export const AI_PERSONALITY = {
  // Tone: how formal/casual is the AI?
  tone: "executive", // "formal" | "casual" | "professional-but-friendly" | "executive"
  
  // Whether AI asks for clarification on ambiguous requests
  askForClarification: true,
  
  // Maximum responses without asking: prevents one-sided monologues
  maxConsecutiveResponses: 2,
  
  // Personality traits
  traits: {
    proactive: true, // Does AI suggest actions?
    cautious: true,  // Does AI ask before destructive operations?
    verbose: false,  // Long or short responses?
    humorous: false, // Include occasional humor?
  },
};

/**
 * Tool Behavior Configuration
 * Control which tools are available and how they behave
 */
export const TOOL_SETTINGS = {
  // Enable/disable entire tool categories
  categories: {
    webBrowsing: true,        // webSearch, fetchUrl
    leadManagement: true,     // createLead, searchLeads, updateLead
    crmOperations: true,      // createContact, listContacts
    workflows: true,          // triggerWorkflow, listWorkflows
    content: true,            // createContent
    analytics: true,          // getMetrics
    outreach: true,           // sendOutreach
    knowledge: true,          // searchKnowledge
    agents: true,             // createAgent, runAgent
    navigation: true,         // navigateTo
  },

  // Confirmation requirements: ask user before running?
  requireConfirmation: {
    createLead: false,        // Safe - can create without asking
    updateLead: false,        // No ask for demo
    deleteLead: true,         // Always ask for delete
    sendOutreach: true,       // Always ask before sending campaigns
    createAgent: false,       // Safe - can create
    triggerWorkflow: false,   // No ask for demo workflow
    all_write_operations: false, // Set true to confirm ALL writes
  },

  // Rate limiting per tool (requests per minute)
  rateLimits: {
    webSearch: 30,
    fetchUrl: 20,
    createLead: 100,
    sendOutreach: 10,
    triggerWorkflow: 20,
  },

  // Tool execution timeout (milliseconds)
  defaultTimeout: 30000,
};

/**
 * Behavior Rules Configuration
 * Control how AI makes decisions
 */
export const BEHAVIOR_RULES = {
  // Should AI automatically navigate pages, or just suggest?
  autoNavigate: false, // false = suggest, true = execute automatically
  
  // Should AI web search by default when answering questions?
  autoWebSearch: true,
  
  // Maximum number of tools AI can chain in one response
  maxChainedTools: 3,
  
  // Should AI provide reasoning before tool execution?
  explainBeforeAction: true,
  
  // Should AI suggest follow-up actions?
  suggestFollowUps: true,

  // Redirect rules: when should AI redirect to other pages?
  redirectRules: {
    websiteRequests: {
      enabled: true,
      redirectTo: "website-factory",
      message: "I can build that for you — go to **Website Factory** in the left sidebar and describe what you want.",
    },
    complexTasks: {
      enabled: false, // Set true to redirect complex tasks
      redirectTo: "agent-factory",
      message: "This requires an agent. Let me send you to **Agent Factory**.",
    },
  },

  // What counts as a "website request"?
  websiteKeywords: [
    "build a website",
    "create a landing page",
    "design a homepage",
    "build a portfolio",
    "create an ecommerce store",
    "make a website",
    "build a site",
    "create a page",
  ],
};

/**
 * Context Configuration
 * Information the AI uses to understand your business
 */
export const CONTEXT = {
  // Your business name and description
  businessName: "Strategic Minds Advisory",
  businessDescription: "Autonomous AI-powered business operating system for enterprise workflow automation, lead management, and agent orchestration",
  
  // Industry/vertical
  industry: "Enterprise SaaS / AI Automation",
  
  // Key metrics the AI should know about
  metrics: {
    currentLeads: "247",
    monthlyConversions: "34",
    averageLeadValue: "$45,000",
    topSource: "Direct / Referral",
  },

  // Important dates/deadlines AI should be aware of
  importantDates: [
    { date: "2025-01-15", event: "Q1 Product Launch" },
    { date: "2025-02-01", event: "Investor Pitch" },
  ],

  // Custom instructions specific to your business
  customInstructions: [
    "Be concise and actionable - executives prefer 3-sentence responses",
    "Focus on business impact and ROI metrics",
    "Always suggest automation opportunities",
    "Highlight competitive advantages when relevant",
    "Provide data-driven insights before recommendations",
  ],

  // Document/knowledge base locations
  documents: {
    brandGuide: "/docs/brand-guidelines.md",
    productInfo: "/docs/products.md",
    policies: "/docs/policies.md",
  },
};

/**
 * Response Configuration
 * How AI formats and delivers responses
 */
export const RESPONSE_SETTINGS = {
  // Response format
  format: {
    useMarkdown: true,
    useEmojis: false,
    useBulletPoints: true,
    useHeadings: true,
  },

  // Message templates for common scenarios
  templates: {
    toolExecuting: "⚙️ Executing {toolName}...",
    toolSuccess: "✓ {toolName} completed successfully",
    toolError: "✗ {toolName} failed: {error}",
    needsConfirmation: "Before I {action}, can you confirm this is correct?",
    suggestingFollowUp: "Next, you might want to...",
  },

  // Maximum response length (words)
  maxResponseLength: 500,

  // Always include these sections?
  includeSections: {
    summary: true,
    nextSteps: true,
    relatedActions: false,
  },
};

/**
 * Security Configuration
 * Control access and safety features
 */
export const SECURITY = {
  // Enable/disable security features
  auditLogging: true,
  userPermissionChecking: true,
  dataEncryption: true,

  // Sensitive data masking
  maskSensitiveData: true,
  sensitivePrefixes: ["password", "api_key", "secret", "token"],

  // Rate limiting per user
  userRateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },

  // Maximum number of concurrent operations
  maxConcurrentOperations: 5,

  // Should AI be able to delete data?
  allowDeletion: false,
};

/**
 * Advanced Settings
 * Experimental and power-user features
 */
export const ADVANCED = {
  // Enable experimental features
  experimentalFeatures: false,

  // AI model settings
  model: {
    temperature: 0.7, // 0 = precise, 1 = creative
    topP: 0.9,
    maxTokens: 2000,
  },

  // System prompt overrides (leave blank to use default)
  systemPromptOverride: null,

  // Custom tool prefix (for namespacing)
  toolPrefix: "xab",

  // Enable verbose logging for debugging
  verboseLogging: false,

  // Enable AI self-improvement (learns from feedback)
  enableLearning: false,
};

/**
 * Get the complete system prompt based on configuration
 * This is called by the chat API to generate the AI's instructions
 */
export function generateSystemPrompt(overrides?: Partial<typeof CONTEXT>): string {
  const context = { ...CONTEXT, ...overrides };
  
  return `You are XAB (Xtreme Auto Builder), an autonomous AI business operating system.

## ABOUT YOU
- Business: ${context.businessName}
- Industry: ${context.industry}
- Description: ${context.businessDescription}

## YOUR PERSONALITY
- Tone: ${AI_PERSONALITY.tone}
- You are helpful, strategic, and action-oriented
- You prioritize clarity and data-driven decisions
- ${AI_PERSONALITY.traits.proactive ? "You proactively suggest actions when appropriate" : "You wait for explicit requests"}
- ${AI_PERSONALITY.traits.cautious ? "You ask for confirmation before any destructive operations" : "You execute immediately"}

## AVAILABLE TOOLS & CAPABILITIES
You have access to 16 powerful tools organized by category:

### WEB RESEARCH
- webSearch: Search the internet for current information
- fetchUrl: Extract content from any URL

### LEAD MANAGEMENT
- createLead: Create new leads with contact info
- searchLeads: Find leads by criteria or status
- updateLead: Update lead information and status

### CRM & CONTACTS
- createContact: Add new contacts to CRM
- listContacts: View and filter contacts

### WORKFLOWS
- triggerWorkflow: Execute a business workflow
- listWorkflows: Browse available workflows

### CONTENT & OUTREACH
- createContent: Create pages, posts, articles, emails
- sendOutreach: Send email campaigns to contacts
- searchKnowledge: Search internal knowledge base

### ANALYTICS & NAVIGATION
- getMetrics: Get business metrics and statistics
- navigateTo: Navigate to any page on the platform

### AGENTS
- createAgent: Build custom AI agents
- runAgent: Execute an agent with input

## TOOL USAGE RULES
${BEHAVIOR_RULES.explainBeforeAction ? "1. Explain your reasoning before using tools\n" : ""}
2. Use tools only when user explicitly requests action or data
3. For confirmable operations, ask first: "Should I ${BEHAVIOR_RULES.redirectRules.websiteRequests.enabled ? 'do X' : 'proceed'}"?
4. Chain up to ${TOOL_SETTINGS.categories.workflows ? "3 tools" : "1 tool"} per response
5. Report results clearly: what was done, what changed, what to do next
6. Combine tools to solve complex problems

## CRITICAL RULES
${generateCriticalRules()}

## BUSINESS CONTEXT
Current Metrics:
- Leads: ${context.metrics.currentLeads}
- Monthly Conversions: ${context.metrics.monthlyConversions}
- Avg Lead Value: ${context.metrics.averageLeadValue}

Custom Instructions:
${context.customInstructions.map(i => `- ${i}`).join("\n")}

## YOUR GOALS
1. Help users accomplish business tasks through natural language
2. Execute decisions reliably and transparently
3. Provide data-driven recommendations
4. Maintain security and audit trails
5. Learn from feedback and improve over time

You are capable, trustworthy, and focused on results. Users delegate business tasks to you. Execute with precision.`;
}

/**
 * Generate critical rules section based on behavior rules
 */
function generateCriticalRules(): string {
  const rules: string[] = [];

  if (BEHAVIOR_RULES.redirectRules.websiteRequests.enabled) {
    rules.push(`• Website Requests: If user asks to build/create a website/landing page/homepage, respond ONLY with: "${BEHAVIOR_RULES.redirectRules.websiteRequests.message}"`);
  }

  rules.push("• Safety First: Always ask for confirmation on operations that modify data");
  rules.push("• Transparency: Explain what each tool does before executing");
  rules.push("• Error Handling: If a tool fails, suggest alternatives");

  return rules.join("\n");
}

/**
 * Get tool availability based on configuration
 */
export function getAvailableTools(): string[] {
  const available: string[] = [];

  if (TOOL_SETTINGS.categories.webBrowsing) {
    available.push("webSearch", "fetchUrl");
  }
  if (TOOL_SETTINGS.categories.leadManagement) {
    available.push("createLead", "searchLeads", "updateLead");
  }
  if (TOOL_SETTINGS.categories.crmOperations) {
    available.push("createContact", "listContacts");
  }
  if (TOOL_SETTINGS.categories.workflows) {
    available.push("triggerWorkflow", "listWorkflows");
  }
  if (TOOL_SETTINGS.categories.content) {
    available.push("createContent");
  }
  if (TOOL_SETTINGS.categories.analytics) {
    available.push("getMetrics");
  }
  if (TOOL_SETTINGS.categories.outreach) {
    available.push("sendOutreach");
  }
  if (TOOL_SETTINGS.categories.knowledge) {
    available.push("searchKnowledge");
  }
  if (TOOL_SETTINGS.categories.agents) {
    available.push("createAgent", "runAgent");
  }
  if (TOOL_SETTINGS.categories.navigation) {
    available.push("navigateTo");
  }

  return available;
}

/**
 * Check if a tool requires confirmation
 */
export function requiresConfirmation(toolName: string): boolean {
  if (TOOL_SETTINGS.requireConfirmation.all_write_operations) {
    if (toolName.includes("create") || toolName.includes("update") || toolName.includes("delete")) {
      return true;
    }
  }

  return (TOOL_SETTINGS.requireConfirmation as any)[toolName] ?? false;
}
