"use client";

import * as React from "react";
import {
  Users, Plus, Search, Mail, Phone, Building2, MoreHorizontal,
  MessageSquare, FileText, Calendar, ChevronRight, Filter,
  StickyNote, Bot, Tag, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate, formatCurrency , fetcher } from "@/lib/utils";
import useSWR from "swr";
import { X, Loader2 } from "lucide-react";


type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  tags: string[];
  notes?: string;
};

const contactColors = ["bg-indigo-500/20 text-indigo-300", "bg-violet-500/20 text-violet-300", "bg-green-500/20 text-green-300", "bg-amber-500/20 text-amber-300", "bg-pink-500/20 text-pink-300"];

// ── Add Contact Modal ────────────────────────────────────────
function AddContactModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, company: company.trim() || null, title: title.trim() || null, tags: [] }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); setLoading(false); return; }
      onCreated();
      setName(""); setEmail(""); setPhone(""); setCompany(""); setTitle("");
      onClose();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Add Contact</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Email</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@co.com" type="email" /></div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Phone</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555-000-0000" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Company</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" /></div>
            <div><label className="text-[11px] font-medium text-[var(--color-muted-foreground)] mb-1 block">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="CEO" /></div>
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [search, setSearch] = React.useState("");
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const { data: allContacts = [], mutate: mutateContacts } = useSWR<Contact[]>("/api/contacts", fetcher);
  const { data: allLeads = [] } = useSWR("/api/leads", fetcher);

  React.useEffect(() => {
    const handler = () => setShowAddModal(true);
    window.addEventListener("new-contact", handler);
    return () => window.removeEventListener("new-contact", handler);
  }, []);

  const active = selectedContact ?? allContacts[0] ?? null;

  const filtered = allContacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  const contactLead = active ? allLeads.find((l: { email?: string }) => l.email === active.email) : null;
  const contactProject: { name: string; status: string; description?: string; budget?: number; progress?: number } | null = null; // linked via leads in this schema

  return (
    <div className="p-6 space-y-6">
      <AddContactModal open={showAddModal} onClose={() => setShowAddModal(false)} onCreated={mutateContacts} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">CRM</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Contacts, relationships, projects, and communication history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { if (active?.email) window.open(`mailto:${active.email}?subject=Hello+${active.name}`, "_blank"); }}>
            <Bot className="w-3.5 h-3.5 text-[var(--color-primary)]" />AI Summary
          </Button>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-3.5 h-3.5" />Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Contact list */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..." className="pl-9 h-8" />
            </div>
            <Button variant="outline" size="icon-sm"><Filter className="w-3.5 h-3.5" /></Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1.5 pr-1">
              {filtered.map((contact, i) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact as Contact)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                    active?.id === contact.id
                      ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={cn("text-xs font-bold", contactColors[i % contactColors.length])}>
                        {contact.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[var(--color-foreground)] truncate">{contact.name}</div>
                      <div className="text-[10px] text-[var(--color-muted-foreground)] truncate">{contact.title} · {contact.company}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Contact detail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {active && (
            <>
              {/* Profile header */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 shrink-0">
                      <AvatarFallback className="text-lg font-bold bg-indigo-500/20 text-indigo-300">
                        {active.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-base font-bold text-[var(--color-foreground)]">{active.name}</h2>
                          <p className="text-sm text-[var(--color-muted-foreground)]">{active.title} at {active.company}</p>
                        </div>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {active.email && (
                          <a href={`mailto:${active.email}`} className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors">
                            <Mail className="w-3.5 h-3.5" />{active.email}
                          </a>
                        )}
                        {active.phone && (
                          <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                            <Phone className="w-3.5 h-3.5" />{active.phone}
                          </span>
                        )}
                        {active.company && (
                          <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                            <Building2 className="w-3.5 h-3.5" />{active.company}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {(active.tags ?? []).map((tag: string) => (
                          <Badge key={tag} variant="muted">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                    {[
                      { icon: Mail, label: "Email", action: () => active.email && window.open(`mailto:${active.email}`, "_blank") },
                      { icon: Phone, label: "Call", action: () => active.phone && window.open(`tel:${active.phone}`, "_blank") },
                      { icon: MessageSquare, label: "WhatsApp", action: () => active.phone && window.open(`https://wa.me/${active.phone.replace(/\D/g,"")}`, "_blank") },
                      { icon: Calendar, label: "Schedule", action: () => window.open(`https://cal.com`, "_blank") },
                      { icon: FileText, label: "Proposal", action: () => window.open(`/projects`, "_self") },
                      { icon: StickyNote, label: "Note", action: () => { /* note tab is right below */ } },
                    ].map((action) => (
                      <Button key={action.label} variant="outline" size="sm" className="gap-1.5 flex-1" onClick={action.action}>
                        <action.icon className="w-3.5 h-3.5" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="timeline">
                <TabsList>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {[
                        { icon: Mail, label: "Email sent", desc: "Follow-up on proposal v2", time: "2h ago", color: "text-indigo-400 bg-indigo-500/10" },
                        { icon: Phone, label: "Call logged", desc: "Discovery call, 25 min", time: "3d ago", color: "text-green-400 bg-green-500/10" },
                        { icon: FileText, label: "Proposal sent", desc: "Custom proposal v2 delivered", time: "5d ago", color: "text-violet-400 bg-violet-500/10" },
                        { icon: MessageSquare, label: "WhatsApp", desc: "Initial outreach", time: "1w ago", color: "text-amber-400 bg-amber-500/10" },
                      ].map((event, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", event.color.split(" ")[1])}>
                            <event.icon className={cn("w-3.5 h-3.5", event.color.split(" ")[0])} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-[var(--color-foreground)]">{event.label}</span>
                              <span className="text-[10px] text-[var(--color-muted-foreground)]">{event.time}</span>
                            </div>
                            <div className="text-[11px] text-[var(--color-muted-foreground)]">{event.desc}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deals">
                  <Card>
                    <CardContent className="p-4">
                      {contactLead ? (
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm font-semibold text-[var(--color-foreground)]">{contactLead.company} Deal</div>
                              <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{contactLead.notes}</div>
                            </div>
                            <Badge variant={contactLead.status === "won" ? "success" : contactLead.status === "negotiation" ? "warning" : "primary"}>
                              {contactLead.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                            <div>
                              <div className="text-[var(--color-muted-foreground)]">Value</div>
                              <div className="font-bold text-[var(--color-foreground)]">{contactLead.value ? formatCurrency(contactLead.value) : "—"}</div>
                            </div>
                            <div>
                              <div className="text-[var(--color-muted-foreground)]">Score</div>
                              <div className="font-bold text-[var(--color-foreground)]">{contactLead.score}/100</div>
                            </div>
                            <div>
                              <div className="text-[var(--color-muted-foreground)]">Source</div>
                              <div className="font-bold text-[var(--color-foreground)] capitalize">{contactLead.source}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-[var(--color-muted-foreground)]">No active deals</p>
                          <Button size="sm" className="mt-3 gap-1.5"><Plus className="w-3.5 h-3.5" />Create Deal</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects">
                  <Card>
                    <CardContent className="p-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                      {(contactProject as any) ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (() => { const cp = contactProject as any; return (
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm font-semibold text-[var(--color-foreground)]">{cp.name}</div>
                            <Badge variant="success">{cp.status}</Badge>
                          </div>
                          <p className="text-xs text-[var(--color-muted-foreground)] mb-3">{cp.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-[var(--color-muted-foreground)]">Budget</div>
                              <div className="font-bold text-[var(--color-foreground)]">{cp.budget ? formatCurrency(cp.budget) : "—"}</div>
                            </div>
                            <div>
                              <div className="text-[var(--color-muted-foreground)]">Progress</div>
                              <div className="font-bold text-[var(--color-foreground)]">{cp.progress}%</div>
                            </div>
                          </div>
                        </div>
                        ); })()
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-[var(--color-muted-foreground)]">No active projects</p>
                          <Button size="sm" className="mt-3 gap-1.5"><Plus className="w-3.5 h-3.5" />Create Project</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes">
                  <Card>
                    <CardContent className="p-4">
                      {active.notes ? (
                        <div className="p-3 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] leading-relaxed">
                          {active.notes}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-[var(--color-muted-foreground)]">No notes yet</p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5">
                        <Plus className="w-3.5 h-3.5" />Add Note
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
