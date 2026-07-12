"use client";

import * as React from "react";
import {
  Settings, Activity, Cpu, Database, Globe, GitBranch, Clock,
  CheckCircle2, AlertCircle, AlertTriangle, Shield, Users,
  Zap, Bot, Workflow, RefreshCw, ExternalLink, Flag, Lock,
  LogOut, ChevronDown, MoreHorizontal, TrendingUp, TrendingDown,
  Server, Eye, Layers, HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


// Static system metrics — these reflect infra constants not stored in the DB
const systemMetrics = [
  { name: "Uptime", value: 99.98, unit: "%", trend: "stable" as const, change: 0, status: "healthy" as const },
  { name: "Avg Latency", value: 42, unit: "ms", trend: "down" as const, change: -3, status: "healthy" as const },
  { name: "CPU Usage", value: 38, unit: "%", trend: "stable" as const, change: 2, status: "healthy" as const },
  { name: "Memory", value: 61, unit: "%", trend: "up" as const, change: 5, status: "healthy" as const },
  { name: "Error Rate", value: 0.12, unit: "%", trend: "down" as const, change: -0.04, status: "healthy" as const },
  { name: "Active Conns", value: 127, unit: "", trend: "stable" as const, change: 0, status: "healthy" as const },
];

const serviceStatuses = [
  { name: "Supabase (DB)", status: "operational" as const, latency: 12, uptime: 99.99 },
  { name: "OpenAI API", status: "operational" as const, latency: 320, uptime: 99.9 },
  { name: "Anthropic API", status: "operational" as const, latency: 410, uptime: 99.8 },
  { name: "Email (Resend)", status: "operational" as const, latency: 180, uptime: 100 },
  { name: "Storage", status: "operational" as const, latency: 28, uptime: 99.99 },
  { name: "Auth Service", status: "operational" as const, latency: 15, uptime: 100 },
];

const users = [
  { id: "u1", name: "John Doe", email: "john@company.com", role: "owner", status: "active", lastSeen: new Date("2024-07-05T15:30:00") },
  { id: "u2", name: "Jane Smith", email: "jane@company.com", role: "admin", status: "active", lastSeen: new Date("2024-07-05T14:00:00") },
  { id: "u3", name: "Alex Johnson", email: "alex@company.com", role: "member", status: "active", lastSeen: new Date("2024-07-04T12:00:00") },
  { id: "u4", name: "Sam Lee", email: "sam@company.com", role: "viewer", status: "inactive", lastSeen: new Date("2024-06-28T09:00:00") },
];

const featureFlags = [
  { key: "whatsapp_integration", label: "WhatsApp Integration", enabled: true, env: "prod" },
  { key: "computer_use_v2", label: "Computer Use v2", enabled: false, env: "beta" },
  { key: "multi_agent_chat", label: "Multi-Agent Chat", enabled: true, env: "prod" },
  { key: "voice_input", label: "Voice Input", enabled: false, env: "dev" },
  { key: "rag_pipeline_v3", label: "RAG Pipeline v3", enabled: true, env: "prod" },
];

export default function AdminPage() {
  const { data: workflowRuns = [] } = useSWR("/api/workflow-runs", fetcher);
  const { data: agents = [] } = useSWR("/api/agents", fetcher);
  const { data: auditLogs = [] } = useSWR("/api/audit-logs", fetcher);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Admin Control Plane</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            System health, observability, user management, and platform configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            All Systems Operational
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </Button>
        </div>
      </div>

      {/* System metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} className="relative">
            <CardContent className="p-4">
              <div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{metric.name}</div>
              <div className="text-lg font-bold text-[var(--color-foreground)]">
                {metric.value}{metric.unit !== "%" ? "" : "%"}
                {metric.unit !== "%" && <span className="text-xs font-normal text-[var(--color-muted-foreground)] ml-1">{metric.unit}</span>}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-semibold mt-1",
                metric.trend === "up" ? "text-green-400" :
                metric.trend === "down" ? "text-red-400" :
                "text-[var(--color-muted-foreground)]"
              )}>
                {metric.trend === "up" ? <TrendingUp className="w-2.5 h-2.5" /> : metric.trend === "down" ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                {Math.abs(metric.change)}{metric.unit === "%" ? "pp" : metric.unit} {metric.trend === "stable" ? "stable" : ""}
              </div>
            </CardContent>
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5 rounded-b",
              metric.status === "healthy" ? "bg-green-500/40" :
              metric.status === "degraded" ? "bg-amber-500/40" :
              "bg-red-500/40"
            )} />
          </Card>
        ))}
      </div>

      <Tabs defaultValue="health">
        <TabsList>
          <TabsTrigger value="health">Service Health</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
        </TabsList>

        {/* Service Health */}
        <TabsContent value="health">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Real-time status of all integrated services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {serviceStatuses.map((service) => (
                  <div key={service.name} className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
                    <span className={cn(
                      "status-dot shrink-0",
                      service.status === "operational" ? "online" :
                      service.status === "degraded" ? "secondary" : "error"
                    )} />
                    <span className="flex-1 text-sm text-[var(--color-foreground)]">{service.name}</span>
                    {service.latency && (
                      <span className="text-[11px] text-[var(--color-muted-foreground)]">{service.latency}ms</span>
                    )}
                    {service.uptime !== undefined && (
                      <span className="text-[11px] text-[var(--color-muted-foreground)]">{service.uptime}%</span>
                    )}
                    <Badge variant={
                      service.status === "operational" ? "default" :
                      service.status === "degraded" ? "secondary" : "destructive"
                    }>
                      {service.status === "operational" ? "OK" : service.status === "degraded" ? "SLOW" : "DOWN"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>System resource consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "CPU Usage", value: 42, color: "bg-indigo-500" },
                  { label: "Memory Usage", value: 68, color: "bg-violet-500" },
                  { label: "Disk I/O", value: 23, color: "bg-amber-500" },
                  { label: "Network Bandwidth", value: 31, color: "bg-green-500" },
                  { label: "DB Connections", value: 56, color: "bg-cyan-500" },
                ].map((res) => (
                  <div key={res.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-muted-foreground)]">{res.label}</span>
                      <span className="font-semibold text-[var(--color-foreground)]">{res.value}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", res.color)} style={{ width: `${res.value}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Queue */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Queue & Runs</CardTitle>
                <Badge variant="default">{workflowRuns.filter((r: any) => r.status === "running").length} running</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {["Run ID", "Workflow", "Status", "Started", "Duration", "Logs"].map((h) => (
                        <th key={h} className="text-left text-[var(--color-muted-foreground)] font-medium px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workflowRuns.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-[var(--color-muted-foreground)]">No workflow runs yet.</td></tr>
                    )}
                  {workflowRuns.map((run: any) => (
                      <tr key={run.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                        <td className="px-5 py-3 font-mono text-indigo-400">{run.id.slice(0, 8)}</td>
                        <td className="px-5 py-3 text-[var(--color-foreground)]">{run.workflow_name ?? run.workflowId ?? "—"}</td>
                        <td className="px-5 py-3">
                          <Badge variant={
                            run.status === "default" ? "default" :
                            run.status === "running" ? "default" :
                            run.status === "failed" ? "destructive" : "outline"
                          }>{run.status}</Badge>
                        </td>
                        <td className="px-5 py-3 text-[var(--color-muted-foreground)]"><RelativeTime date={new Date(run.started_at ?? run.startedAt)} /></td>
                        <td className="px-5 py-3 text-[var(--color-muted-foreground)]">{run.duration_ms ? `${Math.round(run.duration_ms / 1000)}s` : "—"}</td>
                        <td className="px-5 py-3">
                          <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents */}
        <TabsContent value="agents">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Running Agents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {["Agent", "Type", "Status", "Runs", "Success Rate", "Last Run", "Memory"].map((h) => (
                        <th key={h} className="text-left text-[var(--color-muted-foreground)] font-medium px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length === 0 && (
                      <tr><td colSpan={7} className="px-5 py-8 text-center text-xs text-[var(--color-muted-foreground)]">No agents configured yet.</td></tr>
                    )}
                  {agents.map((agent: any) => (
                      <tr key={agent.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-[var(--color-surface-3)] flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)]">
                              {(agent.name ?? "?")[0]}
                            </div>
                            <span className="font-medium text-[var(--color-foreground)]">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 capitalize text-[var(--color-muted-foreground)]">{agent.type}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "status-dot",
                              agent.status === "active" || agent.status === "running" ? "online" :
                              agent.status === "error" ? "error" : "offline"
                            )} />
                            <span className="text-[var(--color-foreground)] capitalize">{agent.status}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[var(--color-foreground)]">{(agent.runs ?? 0).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            "font-semibold",
                            (agent.success_rate ?? agent.successRate ?? 0) >= 95 ? "text-green-400" :
                            (agent.success_rate ?? agent.successRate ?? 0) >= 85 ? "text-amber-400" : "text-red-400"
                          )}>{agent.success_rate ?? agent.successRate ?? 0}%</span>
                        </td>
                        <td className="px-5 py-3 text-[var(--color-muted-foreground)]">
                          {agent.last_run_at ?? agent.lastRunAt ? <RelativeTime date={new Date(agent.last_run_at ?? agent.lastRunAt)} /> : "Never"}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={agent.memory ? "default" : "outline"}>
                            {agent.memory ? "On" : "Off"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button size="sm" className="gap-1.5"><Users className="w-3.5 h-3.5" />Invite User</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {["User", "Email", "Role", "Status", "Last Seen", "Actions"].map((h) => (
                        <th key={h} className="text-left text-[var(--color-muted-foreground)] font-medium px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-[9px]">
                                {user.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-[var(--color-foreground)]">{user.name}</span>
                            {user.role === "owner" && <Badge variant="default">Owner</Badge>}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[var(--color-muted-foreground)]">{user.email}</td>
                        <td className="px-5 py-3 capitalize text-[var(--color-foreground)]">{user.role}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "status-dot",
                              user.status === "active" ? "online" : "offline"
                            )} />
                            <span className={cn(
                              user.status === "active" ? "text-green-400" : "text-[var(--color-muted-foreground)]"
                            )}>{user.status}</span>
                          </div>
                        </td>
                              <td className="px-5 py-3 text-[var(--color-muted-foreground)]"><RelativeTime date={user.lastSeen} /></td>
                        <td className="px-5 py-3">
                          <Button variant="ghost" size="sm"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>All user and system actions with full trace</CardDescription>
                </div>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-[var(--color-border)]">
                  {auditLogs.length === 0 && (
                    <div className="px-5 py-8 text-center text-xs text-[var(--color-muted-foreground)]">No audit events recorded yet.</div>
                  )}
                  {auditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-4 px-5 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 text-[var(--color-muted-foreground)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs font-mono text-amber-400">{log.action}</code>
                          <span className="text-xs text-[var(--color-muted-foreground)]">on</span>
                          <code className="text-xs font-mono text-indigo-400">{log.resource ?? log.entity_type}/{log.resource_id ?? log.entity_id ?? "—"}</code>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-[var(--color-muted-foreground)]">by {log.user_id ?? log.userId}</span>
                          {(log.ip_address ?? log.ip) && <span className="text-[10px] text-[var(--color-muted-foreground)] font-mono">{log.ip_address ?? log.ip}</span>}
                          <RelativeTime date={new Date(log.created_at ?? log.createdAt)} className="text-[10px] text-[var(--color-muted-foreground)]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="flags">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[var(--color-primary)]" />
                <CardTitle>Feature Flags</CardTitle>
              </div>
              <CardDescription>Control feature rollout and environment-specific capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {featureFlags.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      flag.enabled ? "bg-green-400" : "bg-[var(--color-muted-foreground)]"
                    )} />
                    <div>
                      <div className="text-xs font-semibold text-[var(--color-foreground)]">{flag.label}</div>
                      <code className="text-[10px] text-[var(--color-muted-foreground)] font-mono">{flag.key}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      flag.env === "prod" ? "default" :
                      flag.env === "beta" ? "secondary" : "outline"
                    }>
                      {flag.env}
                    </Badge>
                    <div className={cn(
                      "w-9 h-5 rounded-full transition-colors cursor-pointer relative",
                      flag.enabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-4)]"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                        flag.enabled ? "translate-x-4" : "translate-x-0.5"
                      )} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
