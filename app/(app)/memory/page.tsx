"use client";

import * as React from "react";
import {
  Brain, Plus, Search, Building2, FolderKanban, User, MessageSquare,
  Trash2, Edit2, Clock, RefreshCw, Filter, ChevronDown, Zap,
  Lock, Globe, Database, MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";


type MemoryRecord = {
  id: string;
  key: string;
  value: string;
  type: "organization" | "project" | "user" | "conversation";
  scope: string;
  created_at: string;
};

const memoryTypeConfig = {
  organization: {
    icon: Building2,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    label: "Organization",
  },
  project: {
    icon: FolderKanban,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    label: "Project",
  },
  user: {
    icon: User,
    color: "text-green-400",
    bg: "bg-green-500/10",
    label: "User",
  },
  conversation: {
    icon: MessageSquare,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Conversation",
  },
};

export default function MemoryPage() {
  const [search, setSearch] = React.useState("");
  const [activeType, setActiveType] = React.useState<"all" | keyof typeof memoryTypeConfig>("all");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [newKey, setNewKey] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [newType, setNewType] = React.useState<keyof typeof memoryTypeConfig>("organization");
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { data: allMemory = [], mutate } = useSWR<MemoryRecord[]>("/api/memory", fetcher);

  async function handleSaveMemory() {
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey.trim(), value: newValue.trim(), type: newType, scope: newType }),
      });
      if (res.ok) { mutate(); setNewKey(""); setNewValue(""); }
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/memory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate();
      if (expandedId === id) setExpandedId(null);
    } finally { setDeletingId(null); }
  }

  const filtered = allMemory.filter((m) => {
    const matchesType = activeType === "all" || m.type === activeType;
    const matchesSearch = !search || m.key.toLowerCase().includes(search.toLowerCase()) || m.value.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const memoryCounts = {
    organization: allMemory.filter(m => m.type === "organization").length,
    project: allMemory.filter(m => m.type === "project").length,
    user: allMemory.filter(m => m.type === "user").length,
    conversation: allMemory.filter(m => m.type === "conversation").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Memory</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Persistent memory across organization, projects, users, and conversations.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          Add Memory
        </Button>
      </div>

      {/* Memory stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(memoryTypeConfig) as [keyof typeof memoryTypeConfig, typeof memoryTypeConfig[keyof typeof memoryTypeConfig]][]).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setActiveType(activeType === type ? "all" : type)}
            className={cn(
              "text-left p-4 rounded-lg border transition-all cursor-pointer",
              activeType === type
                ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg", config.bg)}>
                <config.icon className={cn("w-3.5 h-3.5", config.color)} />
              </div>
              <span className="text-xs font-semibold text-[var(--color-foreground)]">{config.label}</span>
            </div>
            <div className="text-xl font-bold text-[var(--color-foreground)]">{memoryCounts[type]}</div>
            <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">memory records</div>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory by key or value..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter
          <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory records */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Brain className="w-8 h-8 text-[var(--color-muted-foreground)]/30 mx-auto mb-3" />
              <p className="text-sm text-[var(--color-muted-foreground)]">No memory records found</p>
            </div>
          ) : (
            filtered.map((record) => {
              const config = memoryTypeConfig[record.type];
              const Icon = config.icon;
              const isExpanded = expandedId === record.id;
              return (
                <div
                  key={record.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer text-left"
                  >
                    <div className={cn("p-1.5 rounded shrink-0", config.bg)}>
                      <Icon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-[var(--color-foreground)] truncate">{record.key}</code>
                        <Badge variant="muted" className="text-[9px] capitalize">{record.type}</Badge>
                      </div>
                      <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5 truncate">{record.value}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--color-muted-foreground)]">
                        <RelativeTime date={new Date(record.created_at)} />
                      </span>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--color-muted-foreground)] transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border)] pt-3">
                      {/* Full value */}
                      <div className="p-3 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border)]">
                        <div className="text-[10px] text-[var(--color-muted-foreground)] mb-1.5 font-semibold uppercase tracking-wider">Value</div>
                        <p className="text-sm text-[var(--color-foreground)] leading-relaxed">{record.value}</p>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[var(--color-muted-foreground)]">Scope: </span>
                          <code className="text-[var(--color-foreground)] font-mono">{record.scope}</code>
                        </div>
                        <div>
                          <span className="text-[var(--color-muted-foreground)]">Created: </span>
                          <RelativeTime date={new Date(record.created_at)} className="text-[var(--color-foreground)]" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigator.clipboard.writeText(record.value)}>
                          <Edit2 className="w-3 h-3" /> Copy Value
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-red-400 hover:text-red-400 hover:border-red-500/30" disabled={deletingId === record.id} onClick={() => handleDelete(record.id)}>
                          <Trash2 className="w-3 h-3" /> {deletingId === record.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right panel — memory stats + controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[var(--color-primary)]" />
                <CardTitle>Memory Store</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Records", value: "111", icon: Brain },
                { label: "Total Size", value: "1.2 MB", icon: Database },
                { label: "Agents Using Memory", value: "4", icon: Zap },
                { label: "Last Updated", value: "just now", icon: Clock },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <span className="font-semibold text-[var(--color-foreground)]">{item.value}</span>
                </div>
              ))}
              <Separator />
              <div className="space-y-1.5">
                {[
                  { label: "Organization memory", icon: Lock, enabled: true },
                  { label: "Project memory", icon: Globe, enabled: true },
                  { label: "User preferences", icon: User, enabled: true },
                  { label: "Conversation context", icon: MessageSquare, enabled: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded-md bg-[var(--color-surface-3)]">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-3 h-3 text-[var(--color-muted-foreground)]" />
                      <span className="text-[11px] text-[var(--color-foreground)]">{item.label}</span>
                    </div>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      item.enabled ? "bg-green-400" : "bg-[var(--color-muted-foreground)]"
                    )} />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Memory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Add Memory</CardTitle>
              <CardDescription>Manually inject a memory record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Key (e.g. client_preference)" className="text-xs" />
              <textarea
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder="Value — the information to remember"
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] resize-none"
              />
              <div className="flex items-center gap-2">
                <select value={newType} onChange={e => setNewType(e.target.value as keyof typeof memoryTypeConfig)} className="flex-1 h-8 px-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-foreground)] focus:outline-none">
                  <option value="organization">Organization</option>
                  <option value="project">Project</option>
                  <option value="user">User</option>
                  <option value="conversation">Conversation</option>
                </select>
                <Button size="sm" className="gap-1.5 shrink-0" disabled={saving || !newKey.trim() || !newValue.trim()} onClick={handleSaveMemory}>
                  {saving ? "Saving..." : <><Plus className="w-3 h-3" /> Save</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
