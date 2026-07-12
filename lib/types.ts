// ============================================================
// APEX OS — Shared Type Definitions
// ============================================================

export type ModuleId =
  | "dashboard"
  | "chat"
  | "builder"
  | "research"
  | "computer-use"
  | "website-factory"
  | "workflow-factory"
  | "agent-factory"
  | "client-portal"
  | "crm"
  | "leads"
  | "knowledge"
  | "memory"
  | "admin";

// ─── User / Auth ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "member" | "viewer";
  organizationId: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  logo?: string;
}

// ─── AI Chat ───────────────────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date;
  conversationId: string;
  toolCalls?: ToolCall[];
  artifacts?: Artifact[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "done" | "error";
}

export interface Artifact {
  id: string;
  type: "code" | "markdown" | "html" | "image" | "table";
  title: string;
  content: string;
  language?: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  agentId?: string;
  tags: string[];
  pinned: boolean;
}

// ─── Agents ────────────────────────────────────────────────

export type AgentType =
  | "seo"
  | "sales"
  | "marketing"
  | "proposal"
  | "estimator"
  | "research"
  | "website"
  | "support"
  | "social"
  | "operations"
  | "custom";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  status: "active" | "idle" | "running" | "error" | "disabled";
  permissions: string[];
  memory: boolean;
  createdAt: Date;
  lastRunAt?: Date;
  runs: number;
  successRate: number;
  avatar?: string;
}

// ─── Workflows ─────────────────────────────────────────────

export type WorkflowStatus = "active" | "paused" | "draft" | "archived" | "error";

export interface WorkflowStep {
  id: string;
  name: string;
  type: "action" | "condition" | "trigger" | "agent" | "delay" | "webhook";
  config: Record<string, unknown>;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: "manual" | "cron" | "webhook" | "event" | "agent";
  cronExpression?: string;
  steps: WorkflowStep[];
  lastRunAt?: Date;
  nextRunAt?: Date;
  runs: number;
  successRate: number;
  createdAt: Date;
  agentId?: string;
  tags: string[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "running" | "success" | "failed" | "cancelled";
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  stepId?: string;
  data?: Record<string, unknown>;
}

// ─── CRM ───────────────────────────────────────────────────

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type LeadSource = "website" | "referral" | "linkedin" | "cold" | "whatsapp" | "email" | "other";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  value?: number;
  score: number;
  tags: string[];
  notes: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
  nextFollowUpAt?: Date;
  whatsappId?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  avatar?: string;
  tags: string[];
  notes: string;
  createdAt: Date;
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  budget?: number;
  spent?: number;
  dueDate?: Date;
  tasks: Task[];
  createdAt: Date;
  progress: number;
  phases?: string[];
  team?: string[];
  tags?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  projectId?: string;
}

// ─── Knowledge / Memory ────────────────────────────────────

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  type: "document" | "webpage" | "note" | "pdf" | "code";
  tags: string[];
  embedding?: number[];
  createdAt: Date;
  indexedAt?: Date;
}

export interface MemoryRecord {
  id: string;
  type: "project" | "organization" | "conversation" | "user";
  key: string;
  value: string;
  scope: string;
  createdAt: Date;
  expiresAt?: Date;
}

// ─── Content & Outreach ────────────────────────────────────

export type ContentType = "blog" | "linkedin" | "twitter" | "email" | "seo" | "landing";
export type ContentStatus = "draft" | "review" | "published" | "archived";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  excerpt: string;
  content?: string;
  wordCount: number;
  seoScore: number;
  keywords?: string[];
  views: number;
  clicks?: number;
  shares?: number;
  createdAt: Date;
  publishedAt?: Date;
  tags: string[];
}

export interface OutreachSequence {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  enrolled: number;
  sent: number;
  replied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  unsubscribeRate: number;
  steps: number;
  createdAt: Date;
}

// ─── Admin / Observability ─────────────────────────────────

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  status: "healthy" | "degraded" | "down";
}

export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  latency?: number;
  uptime?: number;
  lastChecked: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}
