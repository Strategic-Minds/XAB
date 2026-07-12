"use client";

import * as React from "react";
import {
  TrendingUp, Plus, Search, Filter, MoreHorizontal, ChevronRight,
  Mail, Phone, MessageSquare, Bot, SlidersHorizontal, ArrowUpDown,
  Star, Clock, DollarSign, Users, Target, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";
import { X, Loader2 } from "lucide-react";


type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

const statusColumns: { status: LeadStatus; label: string; color: string; bg: string }[] = [
  { status: "new", label: "New", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  { status: "contacted", label: "Contacted", color: "text-blue-400", bg: "bg-blue-500/10" },
  { status: "qualified", label: "Qualified", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { status: "proposal", label: "Proposal", color: "text-violet-400", bg: "bg-violet-500/10" },
  { status: "negotiation", label: "Negotiation", color: "text-amber-400", bg: "bg-amber-500/10" },
  { status: "won", label: "Won", color: "text-green-400", bg: "bg-green-500/10" },
];

type Lead = {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source: string;
  value?: number;
  score: number;
  tags: string[];
  last_contact_at?: string;
};

const statusBadgeVariant: Record<string, "default" | "primary" | "success" | "warning" | "danger" | "muted" | "outline"> = {
  new: "muted",
  contacted: "primary",
  qualified: "primary",
  proposal: "warning",
  negotiation: "warning",
  won: "success",
  lost: "danger",
};

// ── Add Lead Modal ──────────────────────────────────────────
function AddLeadModal({ open, onClose, onCreated, defaultStatus = "new" }: {
  open: boolean; onClose: () => void; onCreated: () => void; defaultStatus?: string;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [value, setValue] = React.useState("");
  const [status, setStatus] = React.useState<string>(defaultStatus);
  const [source, setSource] = React.useState("manual");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setStatus(defaultStatus);
  }, [open, defaultStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, company: company.trim() || null, value: value ? Number(value) : null, status, source, score: 50, tags: [] }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); setLoading(false); return; }
      onCreated();
      setName(""); setEmail(""); setCompany(""); setValue(""); setStatus(defaultStatus); setSource("manual");
      onClose();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Add Lead</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Email</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@co.com" type="email" /></div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Company</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Deal Value ($)</label>
              <Input value={value} onChange={e => setValue(e.target.value)} placeholder="5000" type="number" min="0" /></div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
                {["new","contacted","qualified","proposal","negotiation","won"].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Source</label>
            <select value={source} onChange={e => setSource(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
              {["manual","referral","website","cold-email","linkedin","ads","other"].map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"board" | "table">("board");
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addDefaultStatus, setAddDefaultStatus] = React.useState("new");
  const [qualifying, setQualifying] = React.useState(false);

  const { data: allLeads = [], mutate } = useSWR<Lead[]>("/api/leads", fetcher);

  React.useEffect(() => {
    const handler = () => openAddLead("new");
    window.addEventListener("new-lead", handler);
    return () => window.removeEventListener("new-lead", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = allLeads.filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = allLeads.reduce((a, b) => a + (b.value ?? 0), 0);
  const wonValue = allLeads.filter(l => l.status === "won").reduce((a, b) => a + (b.value ?? 0), 0);

  async function handleAIQualify() {
    setQualifying(true);
    // Simulate AI scoring — in production this would call an agent endpoint
    await new Promise(r => setTimeout(r, 1500));
    setQualifying(false);
  }

  function openAddLead(status = "new") {
    setAddDefaultStatus(status);
    setShowAddModal(true);
  }

  return (
    <div className="p-6 space-y-6">
      <AddLeadModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={mutate} defaultStatus={addDefaultStatus} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Lead Pipeline</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Track, qualify, and convert inbound leads with AI-assisted scoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAIQualify} disabled={qualifying}>
            {qualifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
            {qualifying ? "Qualifying..." : "AI Qualify All"}
          </Button>
          <Button className="gap-2" onClick={() => openAddLead("new")}>
            <Plus className="w-3.5 h-3.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pipeline", value: formatCurrency(totalValue), icon: DollarSign, color: "text-[var(--color-primary)]" },
          { label: "Total Leads", value: allLeads.length, icon: Users, color: "text-indigo-400" },
          { label: "Won Revenue", value: formatCurrency(wonValue), icon: Target, color: "text-green-400" },
          { label: "Avg Score", value: allLeads.length ? Math.round(allLeads.reduce((a, b) => a + b.score, 0) / allLeads.length) : 0, icon: Star, color: "text-amber-400" },
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
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9 h-8"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="w-3.5 h-3.5" />Filter
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />Sort
        </Button>
        <div className="ml-auto flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          {(["board", "table"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer",
                viewMode === mode
                  ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Board view */}
      {viewMode === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {statusColumns.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col.status);
            const colValue = colLeads.reduce((a, b) => a + (b.value ?? 0), 0);
            return (
              <div key={col.status} className="shrink-0 w-[220px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", col.bg.replace("bg-", "bg-").replace("/10", ""))} style={{ background: undefined }}>
                      <span className={cn("inline-block w-2 h-2 rounded-full", col.color.replace("text-", "bg-"))} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-foreground)]">{col.label}</span>
                    <span className="text-[10px] text-[var(--color-muted-foreground)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-1.5 py-0.5">
                      {colLeads.length}
                    </span>
                  </div>
                  {colValue > 0 && (
                    <span className="text-[10px] font-semibold text-[var(--color-muted-foreground)]">{formatCurrency(colValue)}</span>
                  )}
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {colLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="w-full text-left p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-3)] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[9px] bg-indigo-500/20 text-indigo-300">
                              {lead.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs font-semibold text-[var(--color-foreground)]">{lead.name}</div>
                            <div className="text-[10px] text-[var(--color-muted-foreground)]">{lead.company}</div>
                          </div>
                        </div>
                      </div>
                      {lead.value && (
                        <div className="text-xs font-bold text-[var(--color-foreground)] mb-1.5">{formatCurrency(lead.value)}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Progress value={lead.score} className="w-14 h-1" />
                          <span className="text-[10px] text-[var(--color-muted-foreground)]">{lead.score}</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <Mail className="w-3 h-3" />
                          </button>
                          <button className="p-1 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                            <MessageSquare className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] capitalize">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Add card button */}
                  <button
                    onClick={() => openAddLead(col.status)}
                    className="w-full p-2 rounded-lg border border-dashed border-[var(--color-border)] text-[10px] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <Plus className="w-3 h-3" />Add lead
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {["Name", "Company", "Status", "Value", "Score", "Source", "Tags", "Last Contact", ""].map((h) => (
                      <th key={h} className="text-left text-[var(--color-muted-foreground)] font-medium px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {h}
                          {h && h !== "" && <ArrowUpDown className="w-2.5 h-2.5 opacity-40" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[9px] bg-indigo-500/20 text-indigo-300">
                              {lead.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-[var(--color-foreground)]">{lead.name}</div>
                            <div className="text-[10px] text-[var(--color-muted-foreground)]">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{lead.company}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant[lead.status]}>{lead.status}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--color-foreground)]">
                        {lead.value ? formatCurrency(lead.value) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={lead.score} className="w-12 h-1.5" />
                          <span className="font-semibold text-[var(--color-foreground)]">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted-foreground)] capitalize">{lead.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {lead.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                        {lead.last_contact_at ? <RelativeTime date={new Date(lead.last_contact_at)} /> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
