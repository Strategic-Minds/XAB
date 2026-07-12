"use client";

import * as React from "react";
import {
  Building2, Plus, Globe, Users, FileText, CheckCircle2,
  Clock, TrendingUp, MessageSquare, Lock, Eye, Share2,
  MoreHorizontal, Activity, DollarSign, Calendar, ExternalLink,
  Shield, ChevronRight, Zap, X, Loader2, Copy, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, formatDate , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";



// ── Create Portal Modal ──────────────────────────────────────
function CreatePortalModal({ open, onClose, onCreated, projects }: {
  open: boolean; onClose: () => void; onCreated: (p: ClientPortal) => void; projects: any[];
}) {
  const [clientName, setClientName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    setLoading(true);
    const slug = clientName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const portal: ClientPortal = {
      id: Math.random().toString(36).slice(2),
      clientName: clientName.trim(),
      company: company.trim() || clientName.trim(),
      status: "invited",
      url: `portal.yourdomain.com/${slug}`,
      projectId,
      views: 0,
    };
    await new Promise(r => setTimeout(r, 400));
    onCreated(portal);
    setClientName(""); setCompany(""); setProjectId("");
    setLoading(false);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Create Client Portal</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Client Name *</label>
            <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Sarah Johnson" required /></div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Company</label>
            <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" /></div>
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Linked Project</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full h-9 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
              <option value="">None</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !clientName.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating...</> : "Create Portal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ClientPortal {
  id: string;
  clientName: string;
  company: string;
  status: "active" | "invited" | "inactive";
  url: string;
  projectId: string;
  lastVisit?: Date;
  views: number;
}

const portals: ClientPortal[] = [];
const portalActivities: { id: string; client: string; action: string; time: Date }[] = [];

export default function ClientPortalPage() {
  const [selectedPortal, setSelectedPortal] = React.useState<ClientPortal | null>(null);
  const [localPortals, setLocalPortals] = React.useState<ClientPortal[]>(portals);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const { data: projects = [] } = useSWR("/api/projects", fetcher);
  const activeProject = projects.find((p: any) => p.id === selectedPortal?.projectId);

  React.useEffect(() => {
    const handler = () => setShowCreateModal(true);
    window.addEventListener("new-portal", handler);
    return () => window.removeEventListener("new-portal", handler);
  }, []);

  async function handleShareLink() {
    if (!selectedPortal) return;
    await navigator.clipboard.writeText(`https://${selectedPortal.url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      <CreatePortalModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(p) => { setLocalPortals(prev => [p, ...prev]); setSelectedPortal(p); }}
        projects={projects}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Client Portal</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Secure, white-labeled client workspaces with project visibility and approval flows.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-3.5 h-3.5" />
          Create Portal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Portals", value: portals.filter(p => p.status === "active").length, icon: Globe, color: "text-[var(--color-primary)]" },
          { label: "Total Views", value: portals.reduce((a, b) => a + b.views, 0), icon: Eye, color: "text-violet-400" },
          { label: "Pending Approvals", value: "3", icon: Clock, color: "text-amber-400" },
          { label: "Active Projects", value: projects.filter((p: any) => p.status === "active").length, icon: Activity, color: "text-green-400" },
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
        {/* Portal list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Client Portals</h2>
          <div className="space-y-2">
            {localPortals.length === 0 && (
              <div className="py-8 text-center text-[12px] text-[var(--color-muted-foreground)]">No portals yet — click &ldquo;Create Portal&rdquo; to get started</div>
            )}
            {localPortals.map((portal) => (
              <button
                key={portal.id}
                onClick={() => setSelectedPortal(portal)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                  selectedPortal?.id === portal.id
                    ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                      {portal.clientName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">{portal.clientName}</span>
                      <Badge variant={portal.status === "active" ? "success" : portal.status === "invited" ? "warning" : "muted"}>
                        {portal.status}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-[var(--color-muted-foreground)] truncate">{portal.company}</div>
                    <div className="text-[10px] text-indigo-400 font-mono truncate mt-0.5">{portal.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--color-muted-foreground)] pl-11">
                  <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{portal.views} views</span>
                  {portal.lastVisit && (
                    <span>Last: <RelativeTime date={portal.lastVisit} /></span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Separator />

          {/* Recent activity */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {portalActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-[var(--color-foreground)]">
                      <span className="font-semibold">{activity.client}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-muted-foreground)]">{activity.action}</div>
                    <RelativeTime date={activity.time} className="text-[10px] text-[var(--color-muted-foreground)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portal detail */}
        <div className="lg:col-span-2">
          {!selectedPortal ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]">
              <Globe className="w-8 h-8 text-[var(--color-muted-foreground)]/20" />
              <p className="text-[13px] text-[var(--color-muted-foreground)]">Select a portal to view details</p>
            </div>
          ) : (
          <Tabs defaultValue="overview">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300 font-bold">
                    {selectedPortal.clientName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-base font-bold text-[var(--color-foreground)]">{selectedPortal.clientName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-muted-foreground)]">{selectedPortal.company}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">{selectedPortal.url}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShareLink}>
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Share Link"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`https://${selectedPortal.url}`, "_blank")}>
                  <ExternalLink className="w-3.5 h-3.5" />Open Portal
                </Button>
              </div>
            </div>

            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                {activeProject && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Active Project</CardTitle>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-foreground)] mb-1">{activeProject.name}</div>
                        <p className="text-xs text-[var(--color-muted-foreground)]">{activeProject.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] text-center">
                          <div className="text-base font-bold text-[var(--color-foreground)]">{activeProject.progress}%</div>
                          <div className="text-[var(--color-muted-foreground)]">Complete</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] text-center">
                          <div className="text-base font-bold text-[var(--color-foreground)]">{activeProject.budget ? formatCurrency(activeProject.budget) : "—"}</div>
                          <div className="text-[var(--color-muted-foreground)]">Budget</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] text-center">
                          <div className="text-base font-bold text-[var(--color-foreground)]">{activeProject.dueDate ? formatDate(activeProject.dueDate) : "—"}</div>
                          <div className="text-[var(--color-muted-foreground)]">Due Date</div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[var(--color-muted-foreground)]">Progress</span>
                          <span className="font-semibold text-[var(--color-foreground)]">{activeProject.progress}%</span>
                        </div>
                        <Progress value={activeProject.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Portal access controls */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                      <CardTitle>Access Controls</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: "Project Timeline", enabled: true, icon: Calendar },
                      { label: "Financial Reports", enabled: false, icon: DollarSign },
                      { label: "File Downloads", enabled: true, icon: FileText },
                      { label: "Team Messaging", enabled: true, icon: MessageSquare },
                      { label: "Proposal Approval", enabled: true, icon: CheckCircle2 },
                    ].map((control) => (
                      <div key={control.label} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-2">
                          <control.icon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                          <span className="text-xs text-[var(--color-foreground)]">{control.label}</span>
                        </div>
                        <div className={cn(
                          "w-8 h-4 rounded-full transition-colors cursor-pointer relative",
                          control.enabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-4)]"
                        )}>
                          <div className={cn(
                            "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                            control.enabled ? "translate-x-4" : "translate-x-0.5"
                          )} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="project">
              <Card>
                <CardHeader><CardTitle>Project Milestones</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Discovery & Architecture", status: "complete", date: "Jun 28" },
                    { name: "Core Development — Phase 1", status: "complete", date: "Jul 12" },
                    { name: "Integration & Testing", status: "in-progress", date: "Jul 30" },
                    { name: "UAT & Launch Prep", status: "pending", date: "Aug 15" },
                    { name: "Production Launch", status: "pending", date: "Sep 1" },
                  ].map((milestone, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        milestone.status === "complete" ? "bg-green-500/10" :
                        milestone.status === "in-progress" ? "bg-indigo-500/10" :
                        "bg-[var(--color-surface-4)]"
                      )}>
                        {milestone.status === "complete" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        ) : milestone.status === "in-progress" ? (
                          <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-[var(--color-foreground)]">{milestone.name}</div>
                        <div className="text-[10px] text-[var(--color-muted-foreground)]">{milestone.date}</div>
                      </div>
                      <Badge variant={
                        milestone.status === "complete" ? "success" :
                        milestone.status === "in-progress" ? "primary" : "muted"
                      }>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader><CardTitle>Shared Documents</CardTitle></CardHeader>
                <CardContent className="divide-y divide-[var(--color-border)]">
                  {[
                    { name: "Project Proposal v3.pdf", size: "2.4 MB", uploaded: "Jul 2", type: "pdf" },
                    { name: "Statement of Work.pdf", size: "1.1 MB", uploaded: "Jul 3", type: "pdf" },
                    { name: "Design Mockups v2.fig", size: "8.7 MB", uploaded: "Jul 4", type: "file" },
                    { name: "Technical Architecture.pdf", size: "3.2 MB", uploaded: "Jul 4", type: "pdf" },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <FileText className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--color-foreground)] truncate">{doc.name}</div>
                        <div className="text-[10px] text-[var(--color-muted-foreground)]">{doc.size} · Uploaded {doc.uploaded}</div>
                      </div>
                      <Button variant="ghost" size="icon-sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Portal Settings</CardTitle>
                  <CardDescription>Configure branding, URL, and notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--color-foreground)]">Portal URL</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
                        <Lock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span className="text-xs text-indigo-400 font-mono">{selectedPortal.url}</span>
                      </div>
                      <Button variant="outline" size="sm">Copy</Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-red-400 hover:border-red-500/30">
                    Revoke Access
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
