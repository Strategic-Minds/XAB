"use client";

import * as React from "react";
import {
  Workflow, Plus, Play, Pause, Archive, Clock, CheckCircle2,
  AlertCircle, Zap, Webhook, Bot, Timer, GitBranch, MoreHorizontal,
  Activity, TrendingUp, ChevronRight, RefreshCw, Loader2, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


type Workflow = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "paused" | "draft" | "archived";
  trigger: "cron" | "event" | "manual" | "webhook";
  cron_expression?: string;
  tags: string[];
  runs: number;
  success_rate: number;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
};

type WorkflowRun = {
  id: string;
  status: "running" | "success" | "failed" | "cancelled";
  started_at: string;
  duration?: number;
};

const triggerConfig = {
  manual: { icon: Play, label: "Manual", color: "text-[var(--color-muted-foreground)]" },
  cron: { icon: Timer, label: "Cron", color: "text-indigo-400" },
  webhook: { icon: Webhook, label: "Webhook", color: "text-violet-400" },
  event: { icon: Zap, label: "Event", color: "text-amber-400" },
  agent: { icon: Bot, label: "Agent", color: "text-green-400" },
};

const statusConfig = {
  active: { variant: "success" as const, label: "Active" },
  paused: { variant: "warning" as const, label: "Paused" },
  draft: { variant: "muted" as const, label: "Draft" },
  archived: { variant: "muted" as const, label: "Archived" },
  error: { variant: "danger" as const, label: "Error" },
};

export default function WorkflowFactoryPage() {
  const { data: allWorkflows = [], mutate } = useSWR<Workflow[]>("/api/workflows", fetcher);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | null>(null);
  const [filter, setFilter] = React.useState<"all" | "active" | "paused" | "cron">("all");
  const [creating, setCreating] = React.useState(false);
  const [runningId, setRunningId] = React.useState<string | null>(null);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [runOutput, setRunOutput] = React.useState<string | null>(null);

  const activeWorkflow = selectedWorkflow ?? allWorkflows[0] ?? null;

  const { data: workflowRuns = [], mutate: mutateRuns } = useSWR<WorkflowRun[]>(
    activeWorkflow ? `/api/workflow-runs?workflow_id=${activeWorkflow.id}` : null,
    fetcher
  );

  React.useEffect(() => {
    window.addEventListener("new-workflow", createWorkflow);
    return () => window.removeEventListener("new-workflow", createWorkflow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createWorkflow() {
    setCreating(true);
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Workflow", trigger: "manual", status: "draft" }),
    });
    mutate();
    setCreating(false);
  }

  async function handleToggle(wf: Workflow) {
    if (togglingId) return;
    setTogglingId(wf.id);
    const newStatus = wf.status === "active" ? "paused" : "active";
    await fetch(`/api/workflows/${wf.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    mutate();
    setTogglingId(null);
  }

  async function handleRunNow(wf: Workflow) {
    if (runningId) return;
    setRunningId(wf.id);
    setRunOutput(null);
    try {
      const res = await fetch(`/api/workflows/${wf.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.output) setRunOutput(json.output);
      mutate();
      mutateRuns();
    } finally {
      setRunningId(null);
    }
  }

  const filtered = allWorkflows.filter((w) => {
    if (filter === "all") return true;
    if (filter === "cron") return w.trigger === "cron";
    return w.status === filter;
  });

  const totalRuns = allWorkflows.reduce((a, b) => a + b.runs, 0);
  const activeCount = allWorkflows.filter(w => w.status === "active").length;
  const avgSuccess = allWorkflows.length
    ? (allWorkflows.reduce((a, b) => a + b.success_rate, 0) / allWorkflows.length).toFixed(1)
    : "0";
  const cronCount = allWorkflows.filter(w => w.trigger === "cron").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Workflow Factory</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Build durable, resumable workflows. Every task is logged, retried, and observable.
          </p>
        </div>
        <Button className="gap-2" onClick={createWorkflow} disabled={creating}>
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Workflows", value: allWorkflows.length, icon: Workflow, color: "text-[var(--color-primary)]" },
          { label: "Active", value: activeCount, icon: Activity, color: "text-green-400" },
          { label: "Cron Scheduled", value: cronCount, icon: Timer, color: "text-indigo-400" },
          { label: "Avg Success", value: `${avgSuccess}%`, icon: TrendingUp, color: "text-cyan-400" },
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
        {/* Workflow list */}
        <div className="space-y-3">
          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "active", "paused", "cron"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors cursor-pointer",
                  filter === f
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((wf) => {
              const trig = triggerConfig[wf.trigger];
              const stat = statusConfig[wf.status];
              const TrigIcon = trig.icon;
              return (
                <button
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                    activeWorkflow?.id === wf.id
                      ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[var(--color-foreground)] leading-tight">{wf.name}</span>
                    <Badge variant={stat.variant}>{stat.label}</Badge>
                  </div>
                  <p className="text-[10px] text-[var(--color-muted-foreground)] mb-2 leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)]">
                      <TrigIcon className={cn("w-3 h-3", trig.color)} />
                      <span>{wf.runs} runs</span>
                      <span>·</span>
                      <span className="text-green-400">{wf.success_rate ?? 0}%</span>
                    </div>
                    {wf.last_run_at && (
                      <span className="text-[10px] text-[var(--color-muted-foreground)]">
                        <RelativeTime date={new Date(wf.last_run_at)} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {activeWorkflow && (() => {
            const trig = triggerConfig[activeWorkflow.trigger];
            const stat = statusConfig[activeWorkflow.status];
            const TrigIcon = trig.icon;

            return (
              <Tabs defaultValue="overview">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-foreground)]">{activeWorkflow.name}</h2>
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{activeWorkflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeWorkflow.status === "active" ? (
                      <Button variant="outline" size="sm" className="gap-1.5" disabled={togglingId === activeWorkflow.id} onClick={() => handleToggle(activeWorkflow)}>
                        {togglingId === activeWorkflow.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="gap-1.5" disabled={togglingId === activeWorkflow.id} onClick={() => handleToggle(activeWorkflow)}>
                        {togglingId === activeWorkflow.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}Resume
                      </Button>
                    )}
                    <Button size="sm" className="gap-1.5" disabled={runningId === activeWorkflow.id} onClick={() => handleRunNow(activeWorkflow)}>
                      {runningId === activeWorkflow.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {runningId === activeWorkflow.id ? "Running..." : "Run Now"}
                    </Button>
                  </div>
                </div>

                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="runs">Run History</TabsTrigger>
                  <TabsTrigger value="config">Config</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Total Runs", value: activeWorkflow.runs },
                            { label: "Success Rate", value: `${activeWorkflow.success_rate}%` },
                            { label: "Last Run", value: activeWorkflow.last_run_at ? <RelativeTime date={new Date(activeWorkflow.last_run_at)} /> : "Never" },
                      ].map((m) => (
                        <Card key={m.label}>
                          <CardContent className="p-3 text-center">
                            <div className="text-base font-bold text-[var(--color-foreground)]">{m.value}</div>
                            <div className="text-[11px] text-[var(--color-muted-foreground)]">{m.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Trigger info */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrigIcon className={cn("w-4 h-4", trig.color)} />
                          <span className="text-sm font-semibold text-[var(--color-foreground)]">Trigger: {trig.label}</span>
                        </div>
                        {activeWorkflow.cron_expression && (
                          <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                            <code className="text-xs font-mono text-indigo-400">{activeWorkflow.cron_expression}</code>
                            {activeWorkflow.next_run_at && (
                              <span className="text-[10px] text-[var(--color-muted-foreground)] ml-auto">
                                Next: {formatDate(activeWorkflow.next_run_at)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(activeWorkflow.tags ?? []).map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Run output */}
                    {runOutput && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Last Run Output</div>
                          <p className="text-xs text-[var(--color-foreground)] whitespace-pre-wrap line-clamp-6 font-mono leading-relaxed">{runOutput}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Success rate bar */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Reliability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-[var(--color-muted-foreground)]">Success rate (all time)</span>
                          <span className="font-bold text-green-400">{activeWorkflow.success_rate}%</span>
                        </div>
                        <Progress value={activeWorkflow.success_rate} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="runs">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Recent Executions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-[var(--color-border)]">
                        {workflowRuns.length === 0 && (
                          <div className="py-8 text-center text-xs text-[var(--color-muted-foreground)]">No runs yet for this workflow</div>
                        )}
                        {workflowRuns.map((run) => (
                          <div key={run.id} className="flex items-center gap-3 p-4 hover:bg-[var(--color-surface-3)] transition-colors">
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              run.status === "success" && "bg-green-500/10",
                              run.status === "running" && "bg-indigo-500/10",
                              run.status === "failed" && "bg-red-500/10",
                            )}>
                              {run.status === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                              {run.status === "running" && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                              {run.status === "failed" && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-[var(--color-muted-foreground)]">#{run.id}</span>
                                <Badge variant={
                                  run.status === "success" ? "success" :
                                  run.status === "running" ? "primary" : "danger"
                                }>{run.status}</Badge>
                              </div>
                              <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
                                Started <RelativeTime date={new Date(run.started_at)} />
                                {run.duration && ` · ${run.duration}s`}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon-sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="config">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Workflow Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { key: "id", value: activeWorkflow.id },
                        { key: "trigger", value: activeWorkflow.trigger },
                        { key: "cronExpression", value: activeWorkflow.cron_expression ?? "—" },
                        { key: "status", value: activeWorkflow.status },
                        { key: "created", value: formatDate(activeWorkflow.created_at) },
                        { key: "retryPolicy", value: "3 attempts, exponential backoff" },
                        { key: "timeout", value: "300s" },
                      ].map((cfg) => (
                        <div key={cfg.key} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                          <span className="text-xs font-mono text-[var(--color-muted-foreground)]">{cfg.key}</span>
                          <span className="text-xs text-[var(--color-foreground)] font-medium">{cfg.value}</span>
                        </div>
                      ))}
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
