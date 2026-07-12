"use client";

import * as React from "react";
import {
  Search, Globe, TrendingUp, FileSearch, BarChart3, Link2,
  Play, RefreshCw, Download, ExternalLink, Clock, CheckCircle2,
  AlertCircle, Loader2, Brain, Target, Building2, Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ResearchTask {
  id: string;
  type: "competitor" | "seo" | "industry" | "website";
  target: string;
  status: "pending" | "running" | "complete" | "failed";
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  findings?: number;
}

const researchTasks: ResearchTask[] = [];
const competitorData: { name: string; da: number; backlinks: string; traffic: string; score: number; gaps: number }[] = [];
const seoFindings: { severity: string; count: number; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [];
const industryTrends: { trend: string; momentum: number; growth: string }[] = [];

export default function ResearchPage() {
  const [query, setQuery] = React.useState("");
  const [activeTask, setActiveTask] = React.useState<ResearchTask | null>(null);
  const [researchType, setResearchType] = React.useState<"competitor" | "seo" | "industry" | "website">("competitor");
  const [tasks, setTasks] = React.useState<ResearchTask[]>([]);
  const [running, setRunning] = React.useState(false);

  function handleResearch() {
    if (!query.trim()) return;
    const newTask: ResearchTask = {
      id: Math.random().toString(36).slice(2),
      type: researchType,
      target: query.trim(),
      status: "running",
      progress: 0,
      startedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
    setActiveTask(newTask);
    setRunning(true);

    // Simulate progressive completion
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20 + 10);
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const completed = { ...newTask, status: "complete" as const, progress: 100, completedAt: new Date(), findings: Math.floor(Math.random() * 40 + 10) };
        setTasks(prev => prev.map(t => t.id === newTask.id ? completed : t));
        setActiveTask(completed);
        setRunning(false);
      } else {
        setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, progress } : t));
        setActiveTask(prev => prev?.id === newTask.id ? { ...prev, progress } : prev);
      }
    }, 600);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Research Engine</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">Deep web research, competitor discovery, SEO analysis, and knowledge ingestion.</p>
        </div>
        <Button className="gap-2">
          <Play className="w-3.5 h-3.5" />
          New Research Task
        </Button>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a domain, company, keyword, or topic to research..."
                className="pl-10 h-10"
              />
            </div>
            <div className="flex gap-2">
              {([
                { label: "Competitor", icon: Building2, type: "competitor" },
                { label: "SEO", icon: BarChart3, type: "seo" },
                { label: "Industry", icon: TrendingUp, type: "industry" },
                { label: "Website", icon: Globe, type: "website" },
              ] as const).map((t) => (
                <Button key={t.label} variant={researchType === t.type ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => setResearchType(t.type)}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </Button>
              ))}
            </div>
            <Button className="gap-2 h-10 px-5" onClick={handleResearch} disabled={running || !query.trim()}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {running ? "Researching..." : "Research"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task queue */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Research Queue</h2>
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="py-6 text-center text-[12px] text-[var(--color-muted-foreground)]">No tasks yet — enter a query above and click Research</div>
            )}
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setActiveTask(task)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors cursor-pointer",
                  activeTask?.id === task.id
                    ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]/80"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {task.type === "competitor" && <Building2 className="w-3.5 h-3.5 text-violet-400" />}
                    {task.type === "seo" && <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />}
                    {task.type === "industry" && <TrendingUp className="w-3.5 h-3.5 text-amber-400" />}
                    {task.type === "website" && <Globe className="w-3.5 h-3.5 text-green-400" />}
                    <span className="text-xs font-medium text-[var(--color-foreground)] capitalize">{task.type}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-semibold",
                    task.status === "complete" && "text-green-400",
                    task.status === "running" && "text-indigo-400",
                    task.status === "pending" && "text-[var(--color-muted-foreground)]",
                    task.status === "failed" && "text-red-400",
                  )}>
                    {task.status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    {task.status === "complete" && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {task.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)] font-mono truncate mb-2">{task.target}</div>
                {task.status === "running" && (
                  <Progress value={task.progress} className="h-1" />
                )}
                {task.status === "complete" && task.findings !== undefined && (
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">{task.findings} findings</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="competitors">
            <TabsList>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="seo">SEO Audit</TabsTrigger>
              <TabsTrigger value="trends">Industry Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="competitors">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Competitor Matrix</CardTitle>
                      <CardDescription>Domain authority, traffic, and content gaps</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competitorData.map((c, i) => (
                      <div key={c.name} className={cn(
                        "p-3 rounded-lg border",
                        c.name === "Our Domain"
                          ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
                          : "bg-[var(--color-surface-3)] border-[var(--color-border)]"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {c.name === "Our Domain" && <Star className="w-3.5 h-3.5 text-amber-400" />}
                            <span className="text-sm font-semibold text-[var(--color-foreground)]">{c.name}</span>
                            {c.name === "Our Domain" && <Badge variant="primary">You</Badge>}
                          </div>
                          <span className="text-xs font-bold text-[var(--color-foreground)]">DA {c.da}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                          <div>
                            <div className="text-[var(--color-muted-foreground)]">Backlinks</div>
                            <div className="font-semibold text-[var(--color-foreground)]">{c.backlinks}</div>
                          </div>
                          <div>
                            <div className="text-[var(--color-muted-foreground)]">Monthly Traffic</div>
                            <div className="font-semibold text-[var(--color-foreground)]">{c.traffic}</div>
                          </div>
                          <div>
                            <div className="text-[var(--color-muted-foreground)]">Content Gaps</div>
                            <div className="font-semibold text-[var(--color-foreground)]">{c.gaps}</div>
                          </div>
                        </div>
                        <Progress value={c.score} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                    <div className="text-xs font-semibold text-[var(--color-foreground)] mb-1">AI Insight</div>
                    <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                      You have a 35-point DA gap vs. your top competitor. Closing 38 content gaps and building 50+ quality backlinks could close this gap within 6 months. Priority: target informational keywords where competitors rank 4-10.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Audit Summary</CardTitle>
                  <CardDescription>Technical and on-page findings for acmecorp.com</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {seoFindings.map((f) => (
                      <div key={f.label} className={cn("flex items-center gap-3 p-3 rounded-lg", f.color.split(" ")[1])}>
                        <f.icon className={cn("w-4 h-4", f.color.split(" ")[0])} />
                        <div>
                          <div className={cn("text-lg font-bold", f.color.split(" ")[0])}>{f.count}</div>
                          <div className="text-xs text-[var(--color-muted-foreground)]">{f.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { page: "/pricing", issue: "Title tag too long (78 chars)", severity: "warning" },
                      { page: "/features", issue: "Missing H1 tag", severity: "critical" },
                      { page: "/about", issue: "No meta description", severity: "critical" },
                      { page: "/blog/post-1", issue: "Images missing alt text (4)", severity: "warning" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs">
                        <code className="text-indigo-400 font-mono">{item.page}</code>
                        <span className="flex-1 text-[var(--color-foreground)]">{item.issue}</span>
                        <Badge variant={item.severity === "critical" ? "danger" : "warning"}>{item.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Trends</CardTitle>
                  <CardDescription>AI Workflow Automation — market momentum analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {industryTrends.map((t) => (
                    <div key={t.trend} className="p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--color-foreground)]">{t.trend}</span>
                        <span className="text-xs font-semibold text-green-400">{t.growth}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={t.momentum} className="flex-1" />
                        <span className="text-xs font-bold text-[var(--color-foreground)] w-8 text-right">{t.momentum}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
