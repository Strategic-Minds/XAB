"use client";
import * as React from "react";
import { Brain, Plus, Search, Clock, Tag, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const memories = [
  { key:"APEX_SYSTEM_STATE", summary:"Full APEX agent state — active projects, blockers, last session", tags:["system","apex"], importance:10, updated:"1h ago" },
  { key:"SECRETS_QUICK_REFERENCE", summary:"API credentials map for all integrated services", tags:["credentials","security"], importance:10, updated:"6h ago" },
  { key:"SM_CORP_DRIVE_REGISTRY", summary:"All Google Drive folder IDs across 3 drives", tags:["drive","storage"], importance:9, updated:"2d ago" },
  { key:"NEP_SITE_FINAL_STATE", summary:"National Epoxy Pros deployment — 16/16 routes, lead pipeline verified", tags:["nep","deployment"], importance:8, updated:"2d ago" },
  { key:"XAB_BUILD_LOG", summary:"Enterprise AI App Factory build progress and scaffolding status", tags:["xab","build"], importance:9, updated:"now" },
];

export default function MemoryClient() {
  const [search, setSearch] = React.useState("");
  const filtered = memories.filter(m=>m.key.toLowerCase().includes(search.toLowerCase())||m.summary.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Brain className="w-5 h-5 text-[var(--color-primary)]" /> Memory</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{memories.length} memory records · Supabase pgvector</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>Add Memory</Button>
      </div>
      <div className="px-6 py-4">
        <div className="relative max-w-xs mb-4"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search memory..." className="pl-8 h-8 text-[13px] bg-[var(--color-surface-2)] border-[var(--color-border)]"/></div>
        <div className="space-y-2">
          {filtered.map((m,i)=>(
            <div key={i} className="px-4 py-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-1.5">
                <div className="font-mono text-[12px] font-semibold text-[var(--color-primary)]">{m.key}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1"><Clock className="w-3 h-3"/>{m.updated}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${m.importance>=9?"bg-green-500/20 text-green-400":m.importance>=7?"bg-amber-500/20 text-amber-400":"bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)]"}`}>{m.importance}</div>
                </div>
              </div>
              <div className="text-[12px] text-[var(--color-muted-foreground)] mb-2">{m.summary}</div>
              <div className="flex gap-1.5">{m.tags.map(t=><span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
