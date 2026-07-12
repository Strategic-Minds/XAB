"use client";

import * as React from "react";
import {
  Bot, Plus, Play, Pause, Settings, Zap, Brain, Globe,
  TrendingUp, Users, FileText, BarChart3, Headphones, Share2,
  Activity, CheckCircle2, AlertCircle, Clock, MoreHorizontal,
  ChevronRight, Cpu, Layers, MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatNumber , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


type Agent = {
  id: string;
  name: string;
  type: string;
  description?: string;
  model: string;
  status: "active" | "running" | "inactive" | "error";
  tools: string[];
  system_prompt?: string;
  config: Record<string, unknown>;
  run_count: number;
  success_rate: number;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
};

const agentTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  research: { icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10" },
  sales: { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
  seo: { icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  marketing: { icon: Share2, color: "text-pink-400", bg: "bg-pink-500/10" },
  support: { icon: Headphones, color: "text-amber-400", bg: "bg-amber-500/10" },
  operations: { icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  proposal: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  website: { icon: Globe, color: "text-orange-400", bg: "bg-orange-500/10" },
  custom: { icon: Bot, color: "text-[var(--color-primary)]", bg: "bg-indigo-500/10" },
};

// ── New Agent Modal ──────────────────────────────────────────
function NewAgentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("custom");
  const [model, setModel] = React.useState("gpt-4o");
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, type, model, system_prompt: systemPrompt.trim() || null, status: "active", tools: [], config: {} }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); setLoading(false); return; }
      onCreated();
      setName(""); setDescription(""); setType("custom"); setModel("gpt-4o"); setSystemPrompt("");
      onClose();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">New Agent</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Agent Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sales Hunter Pro" required /></div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this agent do?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
                {["custom","sales","research","seo","marketing","support","operations","proposal","website"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
                {["gpt-4o","gpt-4o-mini","claude-3-5-sonnet","claude-3-haiku"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">System Prompt</label>
            <Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="You are an expert AI agent that..." className="text-xs min-h-[80px] resize-none font-mono" /></div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const agentTemplates = [
  { type: "sales", name: "Sales Hunter", description: "Lead qualification, follow-up sequences, proposals" },
  { type: "research", name: "Research Analyst", description: "Competitor discovery, SEO, market intelligence" },
  { type: "seo", name: "SEO Optimizer", description: "Technical audits, keyword research, content gaps" },
  { type: "marketing", name: "Content Writer", description: "Blog posts, landing pages, email campaigns" },
  { type: "support", name: "Support Bot", description: "24/7 customer support with escalation" },
  { type: "operations", name: "Ops Manager", description: "Workflow automation, task management, reporting" },
];

export default function AgentFactoryPage() {
  const { data: allAgents = [], mutate } = useSWR<Agent[]>("/api/agents", fetcher);
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const [runningId, setRunningId] = React.useState<string | null>(null);
  const [runResult, setRunResult] = React.useState<{ id: string; output: string } | null>(null);
  const [showNewModal, setShowNewModal] = React.useState(false);
  const [configTab, setConfigTab] = React.useState<string>("overview");

  React.useEffect(() => {
    const handler = () => setShowNewModal(true);
    window.addEventListener("new-agent", handler);
    return () => window.removeEventListener("new-agent", handler);
  }, []);

  const activeAgent = selectedAgent ?? allAgents[0] ?? null;

  const totalRuns = allAgents.reduce((a, b) => a + (b.run_count ?? 0), 0);
  const activeCount = allAgents.filter(a => a.status === "active" || a.status === "running").length;
  const avgSuccessRate = allAgents.length
    ? (allAgents.reduce((a, b) => a + (b.success_rate ?? 0), 0) / allAgents.length).toFixed(1)
    : "0";

  async function handleRunAgent(agent: Agent) {
    if (runningId) return;
    setRunningId(agent.id);
    setRunResult(null);
    try {
      const res = await fetch(`/api/agents/${agent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: `Execute your primary task as ${agent.name}.` }),
      });
      const json = await res.json();
      if (json.output) {
        setRunResult({ id: agent.id, output: json.output });
      }
      mutate();
    } catch {
      // silent
    } finally {
      setRunningId(null);
    }
  }

  async function handleCreateFromTemplate(tpl: { type: string; name: string; description: string }) {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tpl.name,
        type: tpl.type,
        description: tpl.description,
        model: "gpt-4o",
        status: "active",
        tools: [],
      }),
    });
    if (res.ok) {
      const agent = await res.json();
      mutate();
      setSelectedAgent(agent);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <NewAgentModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreated={mutate} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Agent Factory</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Create, configure, and deploy specialized AI agents with tools, memory, and workflows.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewModal(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Agent
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: allAgents.length, icon: Bot, color: "text-[var(--color-primary)]" },
          { label: "Active Now", value: activeCount, icon: Activity, color: "text-green-400" },
          { label: "Total Runs", value: formatNumber(totalRuns), icon: Zap, color: "text-amber-400" },
          { label: "Avg Success", value: `${avgSuccessRate}%`, icon: CheckCircle2, color: "text-cyan-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-surface-3)]">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--color-foreground)]">{stat.value}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)]">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Your Agents</h2>
            <Badge variant="muted">{allAgents.length} deployed</Badge>
          </div>
          <div className="space-y-2">
            {allAgents.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--color-muted-foreground)]">No agents yet — create one above</div>
            )}
            {allAgents.map((agent: Agent) => {
              const config = agentTypeConfig[agent.type] ?? agentTypeConfig.custom;
              const Icon = config.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                    activeAgent?.id === agent.id
                      ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">{agent.name}</span>
                        <span className={cn(
                          "status-dot shrink-0 ml-2",
                          agent.status === "active" && "online",
                          agent.status === "running" && "online",
                          agent.status === "inactive" && "offline",
                          agent.status === "error" && "error",
                        )} />
                      </div>
                      <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5 truncate">{agent.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[var(--color-muted-foreground)]">{formatNumber(agent.run_count ?? 0)} runs</span>
                        <span className="text-[10px] text-green-400">{agent.success_rate ?? 0}% success</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Separator />

          {/* Templates */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">Start from template</h3>
            <div className="space-y-1.5">
              {agentTemplates.map((tpl) => {
                const config = agentTypeConfig[tpl.type] ?? agentTypeConfig.custom;
                const Icon = config.icon;
                return (
                  <button
                    key={tpl.type}
                    onClick={() => handleCreateFromTemplate(tpl)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer group"
                  >
                    <div className={cn("p-1.5 rounded", config.bg)}>
                      <Icon className={cn("w-3 h-3", config.color)} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-xs font-medium text-[var(--color-foreground)] truncate">{tpl.name}</div>
                      <div className="text-[10px] text-[var(--color-muted-foreground)] truncate">{tpl.description}</div>
                    </div>
                    <Plus className="w-3 h-3 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Agent detail panel */}
        <div className="lg:col-span-2">
          {activeAgent && (() => {
            const config = agentTypeConfig[activeAgent.type] ?? agentTypeConfig.custom;
            const Icon = config.icon;
            return (
              <Tabs value={configTab} onValueChange={setConfigTab}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl border border-[var(--color-border)]", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--color-foreground)]">{activeAgent.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={
                          activeAgent.status === "active" || activeAgent.status === "running" ? "success" :
                          activeAgent.status === "error" ? "danger" : "muted"
                        }>
                          {activeAgent.status}
                        </Badge>
                        <span className="text-[11px] text-[var(--color-muted-foreground)]">{activeAgent.model}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfigTab("tools")}>
                      <Settings className="w-3.5 h-3.5" />Configure
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={runningId === activeAgent.id}
                      onClick={() => handleRunAgent(activeAgent)}
                    >
                      {runningId === activeAgent.id
                        ? <><Clock className="w-3.5 h-3.5 animate-spin" />Running…</>
                        : <><Play className="w-3.5 h-3.5" />Run Now</>
                      }
                    </Button>
                  </div>
                </div>

                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{activeAgent.description}</p>
                        {runResult?.id === activeAgent.id && (
                          <div className="mt-3 p-3 rounded-lg bg-green-500/8 border border-green-500/20">
                            <div className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1.5">Last Run Output</div>
                            <p className="text-xs text-[var(--color-foreground)] whitespace-pre-wrap line-clamp-4">{runResult.output}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {[
                            { label: "Total Runs", value: formatNumber(activeAgent.run_count ?? 0) },
                            { label: "Success Rate", value: `${activeAgent.success_rate ?? 0}%` },
                            { label: "Last Run", value: activeAgent.last_run_at ? <RelativeTime date={new Date(activeAgent.last_run_at)} /> : "Never" },
                          ].map((m) => (
                            <div key={m.label} className="text-center p-3 rounded-lg bg-[var(--color-surface-3)]">
                              <div className="text-base font-bold text-[var(--color-foreground)]">{m.value}</div>
                              <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance bar */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--color-muted-foreground)]">Last 30 days</span>
                            <span className="font-bold text-green-400">{activeAgent.success_rate}%</span>
                          </div>
                          <Progress value={activeAgent.success_rate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* System prompt preview */}
                    {activeAgent.system_prompt && (
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                            <CardTitle>System Prompt</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-[var(--color-muted-foreground)] font-mono leading-relaxed line-clamp-4">
                            {activeAgent.system_prompt}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tools">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Available Tools</CardTitle>
                      <CardDescription>Tools this agent has access to</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(activeAgent.tools ?? []).map((tool: string) => (
                        <div key={tool} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                          <div className="flex items-center gap-2.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-mono text-[var(--color-foreground)]">{tool}</span>
                          </div>
                          <Badge variant="success">enabled</Badge>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full gap-1.5 mt-2">
                        <Plus className="w-3.5 h-3.5" />Add Tool
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="memory">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Agent Memory</CardTitle>
                      <CardDescription>
                        Stored context and key-value memory for this agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(activeAgent.config ?? {}).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(activeAgent.config).map(([key, val]) => (
                            <div key={key} className="p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                              <div className="text-[10px] font-mono text-[var(--color-primary)] mb-1">{key}</div>
                              <div className="text-xs text-[var(--color-foreground)]">{String(val)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <Brain className="w-8 h-8 text-[var(--color-muted-foreground)]/30 mx-auto mb-2" />
                          <p className="text-sm text-[var(--color-muted-foreground)]">No memory stored yet</p>
                          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">Run this agent to populate its memory</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Execution Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[280px]">
                        <div className="p-4 font-mono text-xs space-y-1.5">
                          {[
                            { ts: "14:32:47", level: "info", msg: "Agent started — run #1247" },
                            { ts: "14:32:47", level: "info", msg: "Loading CRM context for lead: l1" },
                            { ts: "14:32:48", level: "info", msg: "Tool: crm_read → {leadId: 'l1', status: 'qualified'}" },
                            { ts: "14:32:49", level: "info", msg: "Tool: knowledge_read → Found 3 relevant docs" },
                            { ts: "14:32:50", level: "info", msg: "Generating follow-up sequence..." },
                            { ts: "14:32:52", level: "info", msg: "Tool: email_send → Delivered to sarah@acme.com" },
                            { ts: "14:32:52", level: "info", msg: "Memory updated: last_contact_acme" },
                            { ts: "14:32:52", level: "info", msg: "Run complete. Duration: 5.2s" },
                          ].map((log, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-[var(--color-muted-foreground)] shrink-0">{log.ts}</span>
                              <span className={cn(
                                "shrink-0",
                                log.level === "info" && "text-indigo-400",
                                log.level === "warn" && "text-amber-400",
                                log.level === "error" && "text-red-400",
                              )}>[{log.level}]</span>
                              <span className="text-[var(--color-foreground)]">{log.msg}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
