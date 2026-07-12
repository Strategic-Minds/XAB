"use client";

import * as React from "react";
import {
  Monitor, Play, Square, RefreshCw, Camera, MousePointer,
  Keyboard, Globe, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Eye, Download, Maximize2, RotateCcw, Loader2, Plus, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BrowserTask {
  id: string;
  name: string;
  url: string;
  status: "idle" | "running" | "success" | "failed";
  steps: BrowserStep[];
  duration?: number;
  screenshot?: string;
}

interface BrowserStep {
  id: string;
  action: "navigate" | "click" | "type" | "screenshot" | "scroll" | "wait" | "extract";
  description: string;
  status: "pending" | "running" | "done" | "error";
  duration?: number;
}

const sampleTasks: BrowserTask[] = [];

const quickActions: { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; color: string }[] = [
  { label: "Screenshot", icon: Camera,      bg: "bg-indigo-500/10", color: "text-indigo-400" },
  { label: "Click",      icon: MousePointer, bg: "bg-violet-500/10", color: "text-violet-400" },
  { label: "Type",       icon: Keyboard,     bg: "bg-cyan-500/10",   color: "text-cyan-400" },
  { label: "Navigate",   icon: Globe,        bg: "bg-green-500/10",  color: "text-green-400" },
  { label: "Extract",    icon: Download,     bg: "bg-amber-500/10",  color: "text-amber-400" },
  { label: "Scroll",     icon: RotateCcw,    bg: "bg-rose-500/10",   color: "text-rose-400" },
];

export default function ComputerUsePage() {
  const [selectedTask, setSelectedTask] = React.useState<BrowserTask | null>(null);
  const [taskUrl, setTaskUrl] = React.useState("");
  const [instruction, setInstruction] = React.useState("");
  const [browserTasks, setBrowserTasks] = React.useState<BrowserTask[]>(sampleTasks);
  const [running, setRunning] = React.useState(false);

  function handleRunTask() {
    if (!instruction.trim()) return;
    const actions: BrowserStep["action"][] = ["navigate", "screenshot", "click", "extract", "scroll"];
    const steps: BrowserStep[] = instruction.split(/[,.]/).filter(Boolean).slice(0, 5).map((s, i) => ({
      id: `step-${i}`,
      action: actions[i % actions.length],
      description: s.trim(),
      status: "pending",
    }));

    const task: BrowserTask = {
      id: Math.random().toString(36).slice(2),
      name: instruction.trim().slice(0, 50),
      url: taskUrl || "https://example.com",
      status: "running",
      steps,
    };
    setBrowserTasks(prev => [task, ...prev]);
    setSelectedTask(task);
    setRunning(true);

    // Simulate step-by-step execution
    steps.forEach((_, i) => {
      setTimeout(() => {
        setBrowserTasks(prev => prev.map(t => t.id === task.id ? { ...t, steps: t.steps.map((s, si) => si === i ? { ...s, status: "done", duration: Math.floor(Math.random() * 800 + 200) } : s) } : t));
        setSelectedTask(prev => prev?.id === task.id ? { ...prev, steps: prev.steps.map((s, si) => si === i ? { ...s, status: "done", duration: Math.floor(Math.random() * 800 + 200) } : s) } : prev);

        if (i === steps.length - 1) {
          setTimeout(() => {
            const done = { ...task, status: "success" as const, duration: steps.length * 1000, steps: steps.map(s => ({ ...s, status: "done" as const })) };
            setBrowserTasks(prev => prev.map(t => t.id === task.id ? done : t));
            setSelectedTask(done);
            setRunning(false);
            setInstruction("");
          }, 500);
        }
      }, i * 1200);
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Computer Use</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Browser automation, screenshots, page validation, and visual workflows.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          New Browser Task
        </Button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-3)] transition-all cursor-pointer group"
          >
            <div className={cn("p-2.5 rounded-lg", action.bg)}>
              <action.icon className={cn("w-4 h-4", action.color)} />
            </div>
            <span className="text-[11px] text-center font-medium text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Task builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Natural Language Task</CardTitle>
          <CardDescription>Describe what you want the browser agent to do</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
              <Input
                value={taskUrl}
                onChange={(e) => setTaskUrl(e.target.value)}
                placeholder="https://example.com"
                className="pl-10"
              />
            </div>
          </div>
          <div className="relative">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="E.g. Go to the pricing page, take a screenshot of each pricing tier, extract all plan names and prices, then scroll down and screenshot the FAQ section."
              className="w-full min-h-[80px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["Screenshot", "Extract Data", "Validate Form", "Compare Pages"].map((tag) => (
                <button key={tag} className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)]/40 transition-colors cursor-pointer">
                  {tag}
                </button>
              ))}
            </div>
            <Button className="gap-2" onClick={handleRunTask} disabled={running || !instruction.trim()}>
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {running ? "Running..." : "Run Task"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Recent Tasks</h2>
          <div className="space-y-2">
            {browserTasks.length === 0 && (
              <div className="py-6 text-center text-[11px] text-[var(--color-muted-foreground)]">No tasks yet — enter a URL and instruction above</div>
            )}
            {browserTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                  selectedTask?.id === task.id
                    ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                )}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[var(--color-foreground)] leading-tight">{task.name}</span>
                  <Badge
                    variant={
                      task.status === "success" ? "success" :
                      task.status === "running" ? "primary" :
                      task.status === "failed" ? "danger" : "muted"
                    }
                  >
                    {task.status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                    {task.status}
                  </Badge>
                </div>
                <div className="text-[10px] text-[var(--color-muted-foreground)] font-mono truncate mb-2">{task.url}</div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)]">
                  <span>{task.steps.length} steps</span>
                  {task.duration && (
                    <>
                      <span>·</span>
                      <span>{(task.duration / 1000).toFixed(1)}s</span>
                    </>
                  )}
                </div>
                {task.status === "running" && (
                  <Progress
                    value={(task.steps.filter(s => s.status === "done").length / task.steps.length) * 100}
                    className="mt-2 h-1"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Task details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTask && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTask.name}</CardTitle>
                      <CardDescription className="font-mono">{selectedTask.url}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Export
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5" /> Re-run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Step timeline */}
                  <div className="space-y-1.5">
                    {selectedTask.steps.map((step, i) => (
                      <div key={step.id} className="flex items-center gap-3">
                        {/* Step connector */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border",
                            step.status === "done" && "bg-green-500/10 border-green-500/30 text-green-400",
                            step.status === "running" && "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
                            step.status === "pending" && "bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-muted-foreground)]",
                            step.status === "error" && "bg-red-500/10 border-red-500/30 text-red-400",
                          )}>
                            {step.status === "done" ? <CheckCircle2 className="w-3 h-3" /> :
                             step.status === "running" ? <Loader2 className="w-3 h-3 animate-spin" /> :
                             step.status === "error" ? <AlertCircle className="w-3 h-3" /> :
                             <span>{i + 1}</span>}
                          </div>
                          {i < selectedTask.steps.length - 1 && (
                            <div className={cn(
                              "w-px h-4 mt-0.5",
                              step.status === "done" ? "bg-green-500/30" : "bg-[var(--color-border)]"
                            )} />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-mono px-1.5 py-0.5 rounded",
                              step.action === "navigate" && "bg-blue-500/10 text-blue-400",
                              step.action === "screenshot" && "bg-violet-500/10 text-violet-400",
                              step.action === "click" && "bg-amber-500/10 text-amber-400",
                              step.action === "type" && "bg-green-500/10 text-green-400",
                              step.action === "extract" && "bg-indigo-500/10 text-indigo-400",
                              step.action === "scroll" && "bg-cyan-500/10 text-cyan-400",
                              step.action === "wait" && "bg-gray-500/10 text-gray-400",
                            )}>
                              {step.action}
                            </span>
                            <span className="text-xs text-[var(--color-foreground)]">{step.description}</span>
                          </div>
                          {step.duration && (
                            <span className="text-[10px] text-[var(--color-muted-foreground)] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{step.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot preview placeholder */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Screenshot Preview</CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon-sm"><Maximize2 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm"><Download className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] flex items-center justify-center overflow-hidden">
                    {selectedTask.status === "success" ? (
                      <div className="w-full h-full flex flex-col">
                        {/* Simulated browser chrome */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-3)] border-b border-[var(--color-border)]">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                          </div>
                          <div className="flex-1 px-2.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] text-[var(--color-muted-foreground)] font-mono truncate">
                            {selectedTask.url}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
                          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                            {["Starter", "Pro", "Enterprise"].map((plan) => (
                              <div key={plan} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-3)] text-center">
                                <div className="text-[10px] font-semibold text-[var(--color-foreground)]">{plan}</div>
                                <div className="text-xs font-bold text-[var(--color-primary)] mt-1">
                                  {plan === "Starter" ? "$8" : plan === "Pro" ? "$16" : "Custom"}
                                </div>
                                <div className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5">/seat/mo</div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-green-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            47 data points extracted successfully
                          </div>
                        </div>
                      </div>
                    ) : selectedTask.status === "running" ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                        <span className="text-xs text-[var(--color-muted-foreground)]">Browser agent running...</span>
                        <Progress value={40} className="w-48" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Monitor className="w-10 h-10 text-[var(--color-muted-foreground)]/30" />
                        <span className="text-xs text-[var(--color-muted-foreground)]">Run a task to see results</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
