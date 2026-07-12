"use client";

import * as React from "react";
import {
  FolderKanban, Plus, Search, MoreHorizontal, Calendar, Users,
  DollarSign, Target, CheckCircle2, Clock, AlertCircle, ArrowUpRight,
  Filter, SlidersHorizontal, ChevronRight, Bot, Zap, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatCurrency, formatDate , fetcher } from "@/lib/utils";
import useSWR from "swr";
import type { Project, ProjectStatus } from "@/lib/types";
import { X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";



const statusConfig: Record<ProjectStatus, { variant: "default" | "primary" | "success" | "warning" | "danger" | "muted"; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  planning: { variant: "muted", icon: Clock, label: "Planning" },
  active: { variant: "primary", icon: Zap, label: "Active" },
  on_hold: { variant: "warning", icon: AlertCircle, label: "On Hold" },
  completed: { variant: "success", icon: CheckCircle2, label: "Completed" },
  cancelled: { variant: "danger", icon: AlertCircle, label: "Cancelled" },
};

const phaseColors = ["bg-indigo-500/20 text-indigo-300", "bg-violet-500/20 text-violet-300", "bg-blue-500/20 text-blue-300", "bg-green-500/20 text-green-300"];

// ── New Project Modal ────────────────────────────────────────
function NewProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [status, setStatus] = React.useState("planning");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, budget: budget ? Number(budget) : null, due_date: dueDate || null, status, progress: 0, tags: [], phases: [] }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); setLoading(false); return; }
      onCreated();
      setName(""); setDescription(""); setBudget(""); setDueDate(""); setStatus("planning");
      onClose();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Project Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Redesign" required /></div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief project description..." className="text-xs min-h-[72px] resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Budget ($)</label>
              <Input value={budget} onChange={e => setBudget(e.target.value)} placeholder="10000" type="number" min="0" /></div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Due Date</label>
              <Input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" /></div>
          </div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
              {["planning","active","on_hold"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [showNewModal, setShowNewModal] = React.useState(false);

  const { data: allProjects = [], mutate } = useSWR<Project[]>("/api/projects", fetcher);

  React.useEffect(() => {
    const handler = () => setShowNewModal(true);
    window.addEventListener("new-project", handler);
    return () => window.removeEventListener("new-project", handler);
  }, []);

  const filtered = allProjects.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalBudget = allProjects.reduce((a: number, b: Project) => a + (b.budget ?? 0), 0);
  const activeCount = allProjects.filter((p: Project) => p.status === "active").length;
  const completedCount = allProjects.filter((p: Project) => p.status === "completed").length;
  const avgProgress = allProjects.length > 0
    ? Math.round(allProjects.reduce((a: number, b: Project) => a + (b.progress ?? 0), 0) / allProjects.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <NewProjectModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreated={mutate} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Projects</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Client delivery, milestones, and team collaboration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNewModal(true)}>
            <Bot className="w-3.5 h-3.5 text-[var(--color-primary)]" />AI Update
          </Button>
          <Button className="gap-2" onClick={() => setShowNewModal(true)}>
            <Plus className="w-3.5 h-3.5" />New Project
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: allProjects.length, icon: FolderKanban, color: "text-[var(--color-primary)]" },
          { label: "Active", value: activeCount, icon: Zap, color: "text-green-400" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-cyan-400" },
          { label: "Total Budget", value: formatCurrency(totalBudget), icon: DollarSign, color: "text-amber-400" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-surface-3)]">
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--color-foreground)]">{kpi.value}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)]">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9 h-8" />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "active", "planning", "on_hold", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors cursor-pointer",
                statusFilter === s
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              )}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          {(["grid", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer",
                viewMode === m ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)]"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const statCfg = statusConfig[project.status];
            const StatIcon = statCfg.icon;
            return (
              <Card key={project.id} className="group hover:border-[var(--color-primary)]/20 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statCfg.variant}>{statCfg.label}</Badge>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                        {project.name}
                      </h3>
                      <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon-sm" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-[var(--color-muted-foreground)]">Progress</span>
                      <span className="font-bold text-[var(--color-foreground)]">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                    {project.budget && (
                      <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-medium text-[var(--color-foreground)]">{formatCurrency(project.budget)}</span>
                      </div>
                    )}
                    {(project.dueDate ?? (project as any).due_date) && (() => {
                      const raw = project.dueDate ?? (project as any).due_date;
                      const d = new Date(raw);
                      return isNaN(d.getTime()) ? null : (
                        <div className="flex items-center gap-1 text-[var(--color-muted-foreground)]">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(d)}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Phases */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {(project.phases ?? []).slice(0, 2).map((phase: string, pi: number) => (
                        <span key={phase} className={cn("px-1.5 py-0.5 text-[9px] rounded font-medium", phaseColors[pi % phaseColors.length])}>
                          {phase}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-[var(--color-muted-foreground)]">
                        {(() => {
                          const raw = (project as any).created_at ?? project.createdAt;
                          if (!raw) return "";
                          const d = new Date(raw);
                          return isNaN(d.getTime()) ? "" : formatDate(d);
                        })()}
                      </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add project card */}
          <button onClick={() => setShowNewModal(true)} className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-[var(--color-border)] text-center hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer group">
            <Plus className="w-6 h-6 text-[var(--color-muted-foreground)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
            <p className="text-xs font-medium text-[var(--color-foreground)]">Create new project</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">Track deliverables and milestones</p>
          </button>
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {["Project", "Status", "Progress", "Budget", "Due Date", "Tags", ""].map((h) => (
                      <th key={h} className="text-left text-[var(--color-muted-foreground)] font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => {
                    const statCfg = statusConfig[project.status];
                    return (
                      <tr key={project.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[var(--color-foreground)]">{project.name}</div>
                          <div className="text-[10px] text-[var(--color-muted-foreground)] truncate max-w-xs">{project.description}</div>
                        </td>
                        <td className="px-4 py-3"><Badge variant={statCfg.variant}>{statCfg.label}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="w-20 h-1.5" />
                            <span className="font-semibold text-[var(--color-foreground)]">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[var(--color-foreground)]">
                          {project.budget ? formatCurrency(project.budget) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                          {(() => {
                            const raw = project.dueDate ?? (project as any).due_date;
                            if (!raw) return "—";
                            const d = new Date(raw);
                            return isNaN(d.getTime()) ? "—" : formatDate(d);
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {(project.tags ?? []).slice(0, 2).map((t: string) => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
