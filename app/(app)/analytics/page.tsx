"use client";

import * as React from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign,
  Zap, Brain, Clock, Target, ArrowUpRight, Calendar,
  ChevronDown, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency, formatNumber , fetcher } from "@/lib/utils";
import useSWR from "swr";


// Simple sparkline chart using inline SVG
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Simple bar chart
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <div
            className={cn("w-full rounded-t transition-all", color)}
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[9px] text-[var(--color-muted-foreground)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const emptyWeekData = DAYS.map(label => ({ label, value: 0 }));
const emptyWorkflowData = DAYS.map(label => ({ label, value: 0 }));

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState("7d");
  const { data: stats } = useSWR("/api/stats", fetcher);
  const { data: agents = [] } = useSWR("/api/agents", fetcher);
  const { data: workflows = [] } = useSWR("/api/workflows", fetcher);
  const { data: knowledge = [] } = useSWR("/api/knowledge", fetcher);

  const emptySpark = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const sparklineData = {
    revenue: emptySpark,
    leads: emptySpark,
    agents: emptySpark,
    success: emptySpark,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Analytics</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Business intelligence and performance metrics across all systems.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["24h", "7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                period === p
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              )}
            >
              {p}
            </button>
          ))}
          <Button variant="outline" size="sm" className="gap-1.5 ml-2">
            <Calendar className="w-3.5 h-3.5" />Custom
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Pipeline Value",
            value: stats ? formatCurrency(stats.totalRevenue) : "—",
            change: "—",
            positive: true,
            icon: DollarSign,
            color: "text-green-400",
            sparkData: sparklineData.revenue,
            sparkColor: "#4ade80",
          },
          {
            label: "Total Leads",
            value: stats?.totalLeads ?? "—",
            change: "—",
            positive: true,
            icon: Users,
            color: "text-indigo-400",
            sparkData: sparklineData.leads,
            sparkColor: "#818cf8",
          },
          {
            label: "Total Agents",
            value: formatNumber(stats?.totalAgents ?? 0),
            change: "—",
            positive: true,
            icon: Zap,
            color: "text-amber-400",
            sparkData: sparklineData.agents,
            sparkColor: "#fbbf24",
          },
          {
            label: "Active Workflows",
            value: stats?.activeWorkflows ?? "—",
            change: "—",
            positive: true,
            icon: Target,
            color: "text-cyan-400",
            sparkData: sparklineData.success,
            sparkColor: "#22d3ee",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[11px] text-[var(--color-muted-foreground)] font-medium">{kpi.label}</div>
                  <div className="text-2xl font-bold text-[var(--color-foreground)] mt-0.5">{kpi.value}</div>
                </div>
                <div className="p-2 rounded-lg bg-[var(--color-surface-3)]">
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold",
                  kpi.positive ? "text-green-400" : "text-red-400"
                )}>
                  {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </div>
                <Sparkline data={kpi.sparkData} color={kpi.sparkColor} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agent Activity</CardTitle>
                  <CardDescription>Daily runs by all agents, last 7 days</CardDescription>
                </div>
                <Badge variant="success">
                  <Activity className="w-2.5 h-2.5" />Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={emptyWeekData} color="bg-indigo-500/70" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Agent Runs by Type</CardTitle>
                <CardDescription>30-day totals</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBarChart data={agents.slice(0, 5).map((a: { name: string; run_count?: number }) => ({ label: a.name.slice(0, 5), value: a.run_count ?? 0 }))} color="bg-violet-500/70" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Workflow Executions</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <MiniBarChart data={emptyWorkflowData} color="bg-cyan-500/70" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top performers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>By success rate this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {agents.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-[var(--color-muted-foreground)]">No agents yet</div>
              ) : agents.slice(0, 5).map((agent: { id: string; name: string; run_count?: number }, i: number) => {
                const colors = ["bg-green-500", "bg-indigo-500", "bg-violet-500", "bg-amber-500", "bg-cyan-500"];
                const maxRuns = Math.max(...agents.map((a: { run_count?: number }) => a.run_count ?? 0), 1);
                const pct = Math.round(((agent.run_count ?? 0) / maxRuns) * 100);
                return (
                  <div key={agent.id} className="flex items-center gap-3">
                    <span className="text-[10px] text-[var(--color-muted-foreground)] w-3">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--color-foreground)]">{agent.name}</span>
                        <span className="text-[10px] font-bold text-[var(--color-muted-foreground)]">{(agent.run_count ?? 0).toLocaleString()} runs</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-[var(--color-surface-3)]">
                        <div className={cn("h-1 rounded-full", colors[i % colors.length])} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Summary metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>System Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Workflows Active", value: stats?.activeWorkflows ?? 0, total: workflows.length || null, icon: Activity },
                { label: "Docs in Knowledge", value: knowledge.length, total: null, icon: Brain },
                { label: "Total Agents", value: stats?.totalAgents ?? 0, total: agents.length || null, icon: Target },
                { label: "DB Latency", value: "~18ms", total: null, icon: Clock },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <m.icon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                    <span className="text-xs text-[var(--color-muted-foreground)]">{m.label}</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-foreground)]">
                    {m.value}{m.total ? `/${m.total}` : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
