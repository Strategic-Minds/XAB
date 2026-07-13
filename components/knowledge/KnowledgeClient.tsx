"use client";
import * as React from "react";
import { BookOpen, Plus, Search, FileText, Globe, Database, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const docs = [
  { title:"National Epoxy Pros Brand Guide", type:"PDF", size:"2.4 MB", category:"Brand", indexed:true, chunks:142 },
  { title:"XPS Product Catalog 2026", type:"PDF", size:"8.1 MB", category:"Products", indexed:true, chunks:389 },
  { title:"PCU Curriculum Framework", type:"DOC", size:"1.2 MB", category:"Training", indexed:true, chunks:87 },
  { title:"Competitive Intelligence Report", type:"PDF", size:"5.6 MB", category:"Intel", indexed:true, chunks:214 },
  { title:"ACI 310.1-20 Standard", type:"PDF", size:"12.3 MB", category:"Compliance", indexed:false, chunks:0 },
  { title:"AUTO_BUILDER Architecture Docs", type:"MD", size:"0.8 MB", category:"Tech", indexed:true, chunks:56 },
];

const typeColor: Record<string,string> = {
  PDF:"bg-red-500/15 text-red-400",
  DOC:"bg-blue-500/15 text-blue-400",
  MD:"bg-green-500/15 text-green-400",
  URL:"bg-purple-500/15 text-purple-400",
};

export default function KnowledgeClient() {
  const [search, setSearch] = React.useState("");
  const filtered = docs.filter(d=>d.title.toLowerCase().includes(search.toLowerCase()));
  const totalChunks = docs.reduce((s,d)=>s+d.chunks,0);
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><BookOpen className="w-5 h-5 text-[var(--color-primary)]" /> Knowledge Base</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{docs.filter(d=>d.indexed).length} indexed · {totalChunks.toLocaleString()} chunks</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>Add Document</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{l:"Documents",v:docs.length,c:"text-[var(--color-foreground)]"},{l:"Indexed",v:docs.filter(d=>d.indexed).length,c:"text-green-400"},{l:"Total Chunks",v:totalChunks,c:"text-[var(--color-primary)]"},{l:"Pending",v:docs.filter(d=>!d.indexed).length,c:"text-amber-400"}].map(s=>(
          <Card key={s.l} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.l}</div><div className={`text-[26px] font-bold ${s.c}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="relative max-w-xs mb-4"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search docs..." className="pl-8 h-8 text-[13px] bg-[var(--color-surface-2)] border-[var(--color-border)]"/></div>
        <div className="space-y-2">
          {filtered.map((d,i)=>(
            <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer">
              <FileText className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13px] text-[var(--color-foreground)]">{d.title}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">{d.category} · {d.size}{d.indexed?` · ${d.chunks} chunks`:""}</div>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeColor[d.type]}`}>{d.type}</span>
              <span className={`text-[11px] font-semibold ${d.indexed?"text-green-400":"text-amber-400"}`}>{d.indexed?"Indexed":"Pending"}</span>
              <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
