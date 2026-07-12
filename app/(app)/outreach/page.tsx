"use client";

import * as React from "react";
import {
  Mail, Plus, Bot, Send, Eye, MousePointerClick, TrendingUp,
  Users, CheckCircle2, Clock, AlertCircle, MoreHorizontal,
  Zap, Target, MessageSquare, ChevronRight, Loader2, Play, Pause,
  Calendar, Filter, Search, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatNumber , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


type Sequence = {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  enrolled: number;
  sent: number;
  replied: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  unsubscribe_rate: number;
  steps: number;
  created_at: string;
};

const statusVariant = {
  active: "success" as const,
  paused: "warning" as const,
  draft: "muted" as const,
  completed: "primary" as const,
};

export default function OutreachPage() {
  const { data: sequences = [], mutate } = useSWR<Sequence[]>("/api/outreach", fetcher);
  const [selectedSequence, setSelectedSequence] = React.useState<Sequence | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  async function handleNewSequence() {
    setCreating(true);
    await fetch("/api/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Sequence", status: "draft", steps: 3, enrolled: 0, sent: 0, replied: 0, open_rate: 0, click_rate: 0, reply_rate: 0, unsubscribe_rate: 0 }),
    });
    mutate();
    setCreating(false);
  }

  async function handleToggle(seq: Sequence) {
    if (togglingId) return;
    setTogglingId(seq.id);
    const newStatus = seq.status === "active" ? "paused" : "active";
    await fetch("/api/outreach", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: seq.id, status: newStatus }),
    });
    mutate();
    setTogglingId(null);
  }

  const activeSeq = selectedSequence ?? sequences[0] ?? null;

  const totalEnrolled = sequences.reduce((a, b) => a + b.enrolled, 0);
  const totalSent = sequences.reduce((a, b) => a + b.sent, 0);
  const avgOpen = sequences.length ? Math.round(sequences.reduce((a, b) => a + b.open_rate, 0) / sequences.length) : 0;
  const avgReply = sequences.length ? Math.round(sequences.reduce((a, b) => a + b.reply_rate, 0) / sequences.length) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Outreach</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            AI-personalized email sequences, follow-ups, and multi-channel campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Bot className="w-3.5 h-3.5 text-[var(--color-primary)]" />AI Personalize
          </Button>
          <Button className="gap-2" onClick={handleNewSequence} disabled={creating}>
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}New Sequence
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Enrolled", value: formatNumber(totalEnrolled), icon: Users, color: "text-indigo-400" },
          { label: "Emails Sent", value: formatNumber(totalSent), icon: Send, color: "text-[var(--color-primary)]" },
          { label: "Avg Open Rate", value: `${avgOpen}%`, icon: Eye, color: "text-amber-400" },
          { label: "Avg Reply Rate", value: `${avgReply}%`, icon: MessageSquare, color: "text-green-400" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sequence list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Sequences</h2>
          {sequences.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--color-muted-foreground)]">No sequences yet — create one above</div>
          )}
          {sequences.map((seq) => (
            <button
              key={seq.id}
              onClick={() => setSelectedSequence(seq)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                activeSeq?.id === seq.id
                  ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[var(--color-foreground)] truncate">{seq.name}</div>
                  <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{seq.steps} steps · <RelativeTime date={new Date(seq.created_at)} /></div>
                </div>
                <Badge variant={statusVariant[seq.status as keyof typeof statusVariant] ?? "muted"}>{seq.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <div className="text-[var(--color-muted-foreground)]">Enrolled</div>
                  <div className="font-semibold text-[var(--color-foreground)]">{formatNumber(seq.enrolled)}</div>
                </div>
                <div>
                  <div className="text-[var(--color-muted-foreground)]">Open</div>
                  <div className="font-semibold text-amber-400">{seq.open_rate}%</div>
                </div>
                <div>
                  <div className="text-[var(--color-muted-foreground)]">Reply</div>
                  <div className="font-semibold text-green-400">{seq.reply_rate}%</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sequence detail */}
        <div className="lg:col-span-2">
              {activeSeq && (
            <Tabs defaultValue="steps">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-foreground)]">{activeSeq.name}</h2>
                  <div className="flex items-center gap-2 mt.0.5">
                    <Badge variant={statusVariant[activeSeq.status as keyof typeof statusVariant] ?? "muted"}>{activeSeq.status}</Badge>
                    <span className="text-[11px] text-[var(--color-muted-foreground)]">{activeSeq.steps} steps</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeSeq.status === "active" ? (
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={togglingId === activeSeq.id} onClick={() => handleToggle(activeSeq)}>
                      {togglingId === activeSeq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={togglingId === activeSeq.id} onClick={() => handleToggle(activeSeq)}>
                      {togglingId === activeSeq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}Resume
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5" onClick={() => window.open("/leads", "_self")}><Users className="w-3.5 h-3.5" />Enroll</Button>
                </div>
              </div>

              <TabsList>
                <TabsTrigger value="steps">Steps</TabsTrigger>
                <TabsTrigger value="leads">Enrolled</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="steps">
                <div className="space-y-3">
                  {Array.from({ length: activeSeq.steps }, (_, i) => ({
                    step: i + 1,
                    type: i % 3 === 0 ? "email" : i % 3 === 1 ? "wait" : "email",
                    subject: i === 0 ? "Re: Growing {{company}} faster" : i % 3 === 1 ? null : `Follow-up ${i}: Quick question`,
                    delay: i === 0 ? "Immediately" : `Day ${i * 2 + 1}`,
                    opens: Math.floor(Math.random() * 60 + 20),
                    clicks: Math.floor(Math.random() * 20 + 5),
                  })).map((step) => (
                    <Card key={step.step}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            step.type === "email" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]"
                          )}>
                            {step.type === "email" ? <Mail className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-[var(--color-foreground)]">
                                  Step {step.step}: {step.type === "email" ? step.subject : "Wait period"}
                                </div>
                                <div className="text-[10px] text-[var(--color-muted-foreground)]">
                                  {step.type === "email" ? `Send ${step.delay}` : `Delay ${step.delay}`}
                                </div>
                              </div>
                              {step.type === "email" && (
                                <div className="flex items-center gap-3 text-[10px]">
                                  <span className="text-[var(--color-muted-foreground)]">
                                    <Eye className="w-2.5 h-2.5 inline mr-0.5" />{step.opens}%
                                  </span>
                                  <span className="text-[var(--color-muted-foreground)]">
                                    <MousePointerClick className="w-2.5 h-2.5 inline mr-0.5" />{step.clicks}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" size="sm" className="w-full gap-1.5">
                    <Plus className="w-3.5 h-3.5" />Add Step
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="leads">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-[var(--color-border)]">
                      {[
                        { name: "Emma Wilson", company: "Acme Corp", step: 3, status: "replied" },
                        { name: "Sarah Chen", company: "TechStart", step: 2, status: "opened" },
                        { name: "Marcus Rodriguez", company: "GrowthCo", step: 1, status: "sent" },
                        { name: "Priya Sharma", company: "Innovation Inc", step: 2, status: "opened" },
                        { name: "Lucas Kim", company: "Startup XYZ", step: 1, status: "sent" },
                      ].map((lead) => (
                        <div key={lead.name} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[9px] bg-indigo-500/20 text-indigo-300">
                              {lead.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-[var(--color-foreground)]">{lead.name}</div>
                            <div className="text-[10px] text-[var(--color-muted-foreground)]">{lead.company} · Step {lead.step}</div>
                          </div>
                          <Badge variant={
                            lead.status === "replied" ? "success" :
                            lead.status === "opened" ? "warning" : "muted"
                          }>{lead.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Enrolled", value: activeSeq.enrolled, icon: Users, color: "text-indigo-400" },
                    { label: "Emails Sent", value: activeSeq.sent, icon: Send, color: "text-[var(--color-primary)]" },
                    { label: "Open Rate", value: `${activeSeq.open_rate}%`, icon: Eye, color: "text-amber-400" },
                    { label: "Reply Rate", value: `${activeSeq.reply_rate}%`, icon: MessageSquare, color: "text-green-400" },
                    { label: "Click Rate", value: `${activeSeq.click_rate}%`, icon: MousePointerClick, color: "text-violet-400" },
                    { label: "Unsubscribes", value: `${activeSeq.unsubscribe_rate}%`, icon: AlertCircle, color: "text-red-400" },
                  ].map((m) => (
                    <Card key={m.label}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--color-surface-3)]">
                          <m.icon className={cn("w-4 h-4", m.color)} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-[var(--color-foreground)]">{m.value}</div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)]">{m.label}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
