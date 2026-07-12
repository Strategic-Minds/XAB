"use client";

// Dashboard client component
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Zap, Bot,
  ArrowUpRight, Activity, Clock, CheckCircle2, AlertCircle,
  Play, MoreHorizontal, ExternalLink, Sparkles, ChevronRight,
  GitBranch, Eye,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


type SvcStatus = "operational" | "degraded" | "outage";
const serviceStatuses: { name: string; status: SvcStatus }[] = [
  { name: "AI Gateway", status: "operational" },
  { name: "Supabase DB", status: "operational" },
  { name: "Workflow Engine", status: "operational" },
  { name: "Knowledge Index", status: "operational" },
];

const metricIcons = {
  dollar: DollarSign,
  users:  Users,
  zap:    Zap,
  bot:    Bot,
};

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-surface-4)] border border-[var(--color-border)] rounded-lg p-3 shadow-2xl shadow-black/40 text-[11px]">
      <p className="text-[var(--color-muted-foreground)] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-foreground)]">
            {p.name === "revenue" ? formatCurrency(p.value) : p.value.toLocaleString()}
          </span>
          <span className="text-[var(--color-muted-foreground)] capitalize">{p.name}</span>
        </div>
      ))}
    </div>
  );
};

/* empty sparkline placeholder — real data comes from /api/stats over time */
const emptySpark = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default function DashboardClient() {
  const router = useRouter();
  const { data: stats } = useSWR("/api/stats", fetcher);
  const { data: leads } = useSWR("/api/leads", fetcher);
  const { data: wfRuns } = useSWR("/api/workflow-runs", fetcher);
  const { data: agents } = useSWR("/api/agents", fetcher);

  const dashboardMetrics = [
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: "users", trend: "up", change: 8 },
    { label: "Won Revenue", value: stats ? formatCurrency(stats.totalRevenue) : "—", icon: "dollar", trend: "up", change: 12 },
    { label: "Workflow Runs", value: stats?.totalRuns ?? "—", icon: "zap", trend: "up", change: 23 },
    { label: "Active Agents", value: stats?.totalAgents ?? "—", icon: "bot", trend: "up", change: 5 },
  ];

  const recentLeads = (leads ?? []).slice(0, 5);
  const recentRuns = (wfRuns ?? []).slice(0, 5);
  const activeAgents = (agents ?? []).slice(0, 5);

  return (
    <div className="p-5 space-y-5">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--color-foreground)] tracking-tight text-balance">
            Good morning
          </h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">
            Here&apos;s your organization at a glance — {stats?.totalAgents ?? 0} agents, {stats?.activeWorkflows ?? 0} active workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px]">
            <span className="status-dot online" />
            <span className="text-[var(--color-muted-foreground)]">All systems operational</span>
          </div>
          <Button variant="outline" size="sm" className="text-[12px] h-7 gap-1.5" onClick={() => router.push("/analytics")}>
            <ExternalLink className="w-3 h-3" />
            Export
          </Button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dashboardMetrics.map((metric, idx) => {
          const Icon = metricIcons[metric.icon as keyof typeof metricIcons];
          const isUp = metric.trend === "up";
          const spark = emptySpark;

          return (
            <Card key={metric.label} className="relative overflow-hidden group cursor-pointer">
              <CardContent className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1.5 rounded-lg bg-[var(--color-surface-4)] border border-[var(--color-border)]">
                    <Icon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  </div>
                  <span className={cn(
                    "flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                    isUp ? "text-green-400" : "text-red-400",
                  )}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(metric.change)}%
                  </span>
                </div>

                {/* Value */}
                <div className="text-[22px] font-bold text-[var(--color-foreground)] tracking-tight leading-none">
                  {metric.value}
                </div>
                <div className="text-[11px] text-[var(--color-muted-foreground)] mt-1 mb-3">{metric.label}</div>

                {/* Sparkline */}
                <div className="h-8 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spark.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`sg${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={isUp ? "#6366f1" : "#ef4444"} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={isUp ? "#6366f1" : "#ef4444"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={isUp ? "#6366f1" : "#ef4444"} strokeWidth={1.5} fill={`url(#sg${idx})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              {/* hover glow strip */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          );
        })}
      </div>

      {/* ── Charts row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Revenue + leads area chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 px-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[13px]">Revenue &amp; Leads</CardTitle>
                <CardDescription className="text-[11px]">Month-over-month activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {(leads ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] gap-2">
                <Activity className="w-8 h-8 text-[var(--color-muted-foreground)]/20" />
                <p className="text-[12px] text-[var(--color-muted-foreground)]">No data yet — add leads to see activity</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={(leads ?? []).slice(-12).map((l: { created_at: string; value?: number }, i: number) => ({
                    month: new Date(l.created_at).toLocaleDateString("en-US", { month: "short" }),
                    leads: i + 1,
                    revenue: (l.value ?? 0),
                  }))}
                  margin={{ top: 0, right: 0, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e25" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#6b6b7a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b6b7a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={1.5} fill="url(#gRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader className="pb-3 px-5 pt-4">
            <CardTitle className="text-[13px]">Lead Funnel</CardTitle>
            <CardDescription className="text-[11px]">Conversion stages</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {(() => {
              const allLeads = leads ?? [];
              const statuses = [
                { label: "New",       key: "new",       color: "bg-[var(--color-surface-4)]" },
                { label: "Contacted", key: "contacted", color: "bg-indigo-500/50" },
                { label: "Qualified", key: "qualified", color: "bg-indigo-500/70" },
                { label: "Proposal",  key: "proposal",  color: "bg-indigo-500/90" },
                { label: "Won",       key: "won",       color: "bg-green-500" },
              ];
              const counts = statuses.map(s => ({
                ...s,
                count: allLeads.filter((l: { status: string }) => l.status === s.key).length,
              }));
              const maxCount = Math.max(...counts.map(s => s.count), 1);
              const wonCount = counts.find(s => s.key === "won")?.count ?? 0;
              const convRate = allLeads.length > 0 ? ((wonCount / allLeads.length) * 100).toFixed(1) : "0.0";
              if (allLeads.length === 0) {
                return <div className="py-6 text-center text-[12px] text-[var(--color-muted-foreground)]">No leads yet</div>;
              }
              return (
                <>
                  {counts.map((stage) => (
                    <div key={stage.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-muted-foreground)]">{stage.label}</span>
                        <span className="font-semibold text-[var(--color-foreground)] tabular-nums">{stage.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", stage.color)} style={{ width: `${(stage.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <Separator className="my-1" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-muted-foreground)]">Overall conversion</span>
                    <span className="font-bold text-green-400">{convRate}%</span>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom widgets ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Workflow activity */}
        <Card>
          <CardHeader className="pb-2 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px]">Workflow Activity</CardTitle>
              <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-0.5">
            {recentRuns.length === 0 && (
              <div className="py-4 text-center text-[11px] text-[var(--color-muted-foreground)]">No runs yet</div>
            )}
            {recentRuns.map((run: { id: string; status: string; workflow_id: string; started_at: string; duration?: number }) => (
              <div
                key={run.id}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer"
              >
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                  run.status === "success" && "bg-green-500/10",
                  run.status === "running" && "bg-indigo-500/10",
                  run.status === "failed"  && "bg-red-500/10",
                )}>
                  {run.status === "success" && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                  {run.status === "running" && <Play className="w-3 h-3 text-indigo-400 animate-pulse" />}
                  {run.status === "failed"  && <AlertCircle className="w-3 h-3 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--color-foreground)] truncate">
                    Workflow Run
                  </div>
                  <RelativeTime date={new Date(run.started_at)} className="text-[10px] text-[var(--color-muted-foreground)]" />
                </div>
                {run.duration && (
                  <span className="text-[10px] text-[var(--color-muted-foreground)] flex items-center gap-0.5 tabular-nums">
                    <Clock className="w-2.5 h-2.5" />{run.duration}s
                  </span>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full mt-1 text-[11px] gap-1" onClick={() => router.push("/workflow-factory")}>
              View all runs <ChevronRight className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Active agents */}
        <Card>
          <CardHeader className="pb-2 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px]">Active Agents</CardTitle>
              <Button variant="ghost" size="sm" className="text-[11px] gap-1 h-6" onClick={() => router.push("/agent-factory")}>
                All <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-0.5">
            {activeAgents.length === 0 && (
              <div className="py-4 text-center text-[11px] text-[var(--color-muted-foreground)]">No agents yet</div>
            )}
            {activeAgents.map((agent: { id: string; name: string; type?: string; status: string; run_count: number }) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-[var(--color-surface-4)] flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] shrink-0 border border-[var(--color-border)]">
                  {agent.name?.charAt(0) ?? "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--color-foreground)] truncate">{agent.name}</div>
                  <div className="text-[10px] text-[var(--color-muted-foreground)] tabular-nums">{(agent.run_count ?? 0).toLocaleString()} runs</div>
                </div>
                <span className={cn(
                  "status-dot",
                  (agent.status === "active" || agent.status === "running") && "online",
                  agent.status === "idle"  && "offline",
                  agent.status === "error" && "error",
                )} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader className="pb-2 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px]">System Health</CardTitle>
              <Activity className="w-3.5 h-3.5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-3 space-y-1.5">
            {serviceStatuses.slice(0, 6).map((svc) => (
              <div key={svc.name} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "status-dot",
                    svc.status === "operational" && "online",
                    svc.status === "degraded"    && "warning",
                    svc.status === "outage"      && "error",
                  )} />
                  <span className="text-[12px] text-[var(--color-foreground)]">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "text-[10px] font-semibold w-8 text-right",
                    svc.status === "operational" && "text-green-400",
                    svc.status === "degraded"    && "text-amber-400",
                    svc.status === "outage"      && "text-red-400",
                  )}>
                    {svc.status === "operational" ? "OK" : svc.status === "degraded" ? "SLOW" : "DOWN"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Funnel summary ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[13px] flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                Active Funnels
              </CardTitle>
              <CardDescription className="text-[11px]">Live funnel performance</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-[12px] h-7 gap-1.5" asChild>
              <a href="/funnels">
                <ExternalLink className="w-3 h-3" />
                Funnel Builder
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <GitBranch className="w-8 h-8 text-[var(--color-muted-foreground)]/20" />
            <p className="text-[12px] text-[var(--color-muted-foreground)]">No funnels yet — create one in the Funnel Builder</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent leads table ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[13px]">Recent Leads</CardTitle>
              <CardDescription className="text-[11px]">Latest inbound activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-[12px] h-7 gap-1.5" onClick={() => router.push("/leads")}>
              <ExternalLink className="w-3 h-3" />
              Open pipeline
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {["Lead", "Company", "Status", "Value", "Score", "Source", "Updated"].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-[0.06em] px-5 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[11px] text-[var(--color-muted-foreground)]">No leads yet — add your first lead to see it here.</td>
                  </tr>
                )}
                {recentLeads.map((lead: { id: string; name: string; company?: string; status: string; value?: number; score: number; source: string; updated_at: string }) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--color-border)]/60 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[9px] bg-indigo-500/15 text-indigo-300 font-bold">
                            {lead.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-[var(--color-foreground)]">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-muted-foreground)]">{lead.company}</td>
                    <td className="px-5 py-2.5">
                      <Badge variant={
                        lead.status === "won"         ? "success" :
                        lead.status === "negotiation" ? "warning" :
                        (lead.status === "qualified" || lead.status === "proposal") ? "primary" :
                        "muted"
                      }>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 font-medium text-[var(--color-foreground)] tabular-nums">
                      {lead.value ? formatCurrency(lead.value) : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="font-semibold text-[var(--color-foreground)] tabular-nums">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[var(--color-muted-foreground)] capitalize">{lead.source}</td>
                    <td className="px-5 py-2.5 text-[var(--color-muted-foreground)]">
                      <RelativeTime date={new Date(lead.updated_at)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
