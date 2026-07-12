"use client";

import * as React from "react";
import {
  BookOpen, Plus, Search, FileText, Globe, File, Code2,
  StickyNote, Upload, Database, Zap, Clock, CheckCircle2,
  Filter, MoreHorizontal, Tag, Brain, Download, Trash2, X, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate, formatNumber , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


type KnowledgeDoc = {
  id: string;
  title: string;
  source_type: string;
  source_url?: string;
  status: string;
  tokens: number;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  document: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Document" },
  webpage: { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10", label: "Webpage" },
  pdf: { icon: File, color: "text-red-400", bg: "bg-red-500/10", label: "PDF" },
  code: { icon: Code2, color: "text-green-400", bg: "bg-green-500/10", label: "Code" },
  note: { icon: StickyNote, color: "text-amber-400", bg: "bg-amber-500/10", label: "Note" },
  audio: { icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10", label: "Audio" },
  video: { icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10", label: "Video" },
};

export default function KnowledgePage() {
  const [search, setSearch] = React.useState("");
  const [activeType, setActiveType] = React.useState<string>("all");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [showIngestUrl, setShowIngestUrl] = React.useState(false);
  const [ingestUrl, setIngestUrl] = React.useState("");
  const [ingesting, setIngesting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: allDocs = [], mutate } = useSWR<KnowledgeDoc[]>("/api/knowledge", fetcher);

  async function handleIngestUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!ingestUrl.trim()) return;
    setIngesting(true);
    try {
      const hostname = new URL(ingestUrl).hostname;
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: hostname, content: `Ingested from: ${ingestUrl}`, source_type: "webpage", source_url: ingestUrl }),
      });
      if (res.ok) { mutate(); setIngestUrl(""); setShowIngestUrl(false); }
    } catch { /* bad url */ } finally { setIngesting(false); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: file.name, content: text, source_type: file.name.endsWith(".pdf") ? "pdf" : "document" }),
    });
    mutate();
    e.target.value = "";
  }

  const filtered = allDocs.filter((doc) => {
    const matchSearch = !search || doc.title.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "all" || doc.source_type === activeType;
    const matchTag = !activeTag || (doc.tags ?? []).includes(activeTag);
    return matchSearch && matchType && matchTag;
  });

  const counts = {
    all: allDocs.length,
    manual: allDocs.filter(d => d.source_type === "manual").length,
    webpage: allDocs.filter(d => d.source_type === "webpage").length,
    pdf: allDocs.filter(d => d.source_type === "pdf").length,
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent, source_type: "manual" }),
      });
      if (res.ok) {
        mutate();
        setShowCreate(false);
        setNewTitle("");
        setNewContent("");
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Knowledge Base</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Indexed documents, RAG-ready content, and organizational knowledge.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.js,.ts,.tsx" className="hidden" onChange={handleFileUpload} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />Upload
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowIngestUrl(v => !v)}>
            <Globe className="w-3.5 h-3.5" />Ingest URL
          </Button>
          <Button className="gap-2" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-3.5 h-3.5" />{showCreate ? "Cancel" : "New Document"}
          </Button>
        </div>
      </div>

      {/* Ingest URL inline form */}
      {showIngestUrl && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleIngestUrl} className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              <Input
                value={ingestUrl}
                onChange={e => setIngestUrl(e.target.value)}
                placeholder="https://example.com/article"
                type="url"
                className="flex-1"
                required
              />
              <Button type="submit" size="sm" disabled={ingesting || !ingestUrl.trim()}>
                {ingesting ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />Ingesting...</> : "Ingest"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowIngestUrl(false)}>
                <X className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: allDocs.length, icon: Database, color: "text-[var(--color-primary)]" },
          { label: "Indexed", value: allDocs.filter(d => d.status === "indexed").length, icon: CheckCircle2, color: "text-green-400" },
          { label: "Total Tokens", value: formatNumber(allDocs.reduce((a, d) => a + (d.tokens ?? 0), 0)), icon: Brain, color: "text-violet-400" },
          { label: "Last Added", value: allDocs[0] ? <RelativeTime date={new Date(allDocs[0].created_at)} /> : "—", icon: Clock, color: "text-amber-400" },
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

      {/* Inline create form */}
      {showCreate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>New Document</CardTitle>
            <CardDescription>Add a document to your knowledge base. It will be indexed immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--color-foreground)] mb-1 block">Title</label>
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Sales Playbook Q3 2025"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-foreground)] mb-1 block">Content</label>
                <Textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Paste or type your document content…"
                  className="min-h-[120px] font-mono text-xs"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Saving…" : "Save & Index"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 h-8" />
          </div>

          <div>
            <div className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-widest mb-2">Type</div>
            <div className="space-y-0.5">
              {([["all", "All Documents", counts.all], ["manual", "Manual", counts.manual], ["webpage", "Webpages", counts.webpage], ["pdf", "PDFs", counts.pdf]] as [string, string, number][]).map(([type, label, count]) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer",
                    activeType === type
                      ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
                      : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]"
                  )}
                >
                  <span>{label}</span>
                  <span className="text-[10px] bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-full px-1.5 py-0.5">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-widest mb-2">Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {["crm", "strategy", "internal", "research", "sales", "product"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] border transition-colors cursor-pointer",
                    activeTag === tag
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-foreground)]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* RAG status */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <CardTitle>RAG Index</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-[var(--color-muted-foreground)]">Index health</div>
              <Progress value={92} className="h-1.5" />
              <div className="text-[10px] text-[var(--color-muted-foreground)]">1,247 chunks · 5 docs</div>
              <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1">
                <Zap className="w-3 h-3" />Re-index All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Document grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[var(--color-muted-foreground)]">{filtered.length} documents</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Filter className="w-3 h-3" />Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-[var(--color-muted-foreground)]">No documents yet — upload or ingest a URL above.</div>
            )}
            {filtered.map((doc) => {
              const cfg = typeConfig[doc.source_type] ?? typeConfig.document;
              const Icon = cfg.icon;
              return (
                <Card key={doc.id} className="group hover:border-[var(--color-primary)]/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", cfg.bg)}>
                        <Icon className={cn("w-4 h-4", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                              {doc.title}
                            </div>
                            {doc.source_url && (
                              <div className="text-[11px] text-[var(--color-muted-foreground)] font-mono mt-0.5 truncate max-w-xs">
                                {doc.source_url}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {doc.status === "indexed" && (
                              <div className="flex items-center gap-1 text-[10px] text-green-400">
                                <CheckCircle2 className="w-2.5 h-2.5" />Indexed
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex flex-wrap gap-1">
                            {(doc.tags ?? []).map((tag: string) => (
                              <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 ml-auto shrink-0">
                            <span className="text-[10px] text-[var(--color-muted-foreground)]">{formatNumber(doc.tokens ?? 0)} tokens</span>
                            <span className="text-[10px] text-[var(--color-muted-foreground)]">
                              <RelativeTime date={new Date(doc.created_at)} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Upload zone */}
          <div className="mt-4 p-6 rounded-xl border-2 border-dashed border-[var(--color-border)] text-center hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer group">
            <Upload className="w-6 h-6 text-[var(--color-muted-foreground)] mx-auto mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
            <p className="text-xs font-medium text-[var(--color-foreground)]">Drop files or paste a URL</p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">PDF, DOCX, MD, TXT, HTML — auto-indexed for RAG</p>
          </div>
        </div>
      </div>
    </div>
  );
}
