"use client";
import * as React from "react";
import { FolderKanban, Plus, MoreHorizontal, CheckCircle2, Clock, AlertCircle, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const projects = [
  { name:"National Epoxy Pros", client:"NCP LLC", value:"$12,400", status:"Live", progress:100, phase:"Complete", due:"Done" },
  { name:"XAB Enterprise Platform", client:"Strategic Minds", value:"$48,000", status:"In Progress", progress:68, phase:"Phase 2", due:"Jul 30" },
  { name:"XPS Shopify Rebuild", client:"XPS", value:"$8,200", status:"In Progress", progress:45, phase:"Phase 1", due:"Aug 15" },
  { name:"Phoenix Epoxy Pros", client:"PEP LLC", value:"$6,800", status:"Planning", progress:20, phase:"Discovery", due:"Aug 1" },
  { name:"PCU Alumni Outreach", client:"PCU", value:"$3,400", status:"In Progress", progress:72, phase:"Phase 3", due:"Jul 25" },
];

const statusColor: Record<string,string> = {
  "Live":"bg-green-500/15 text-green-400",
  "In Progress":"bg-indigo-500/15 text-indigo-400",
  "Planning":"bg-amber-500/15 text-amber-400",
  "On Hold":"bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)]",
};

export default function ProjectsClient() {
  const total = projects.reduce((s,p)=>s+parseInt(p.value.replace(/[$,]/g,"")),0);
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><FolderKanban className="w-5 h-5 text-[var(--color-primary)]" /> Projects</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{projects.length} projects · ${total.toLocaleString()} total value</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>New Project</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{l:"Active",v:projects.filter(p=>p.status==="In Progress").length,c:"text-[var(--color-primary)]"},{l:"Live",v:projects.filter(p=>p.status==="Live").length,c:"text-green-400"},{l:"Planning",v:projects.filter(p=>p.status==="Planning").length,c:"text-amber-400"},{l:"Total Value",v:`$${total.toLocaleString()}`,c:"text-[var(--color-foreground)]"}].map(s=>(
          <Card key={s.l} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.l}</div><div className={`text-[22px] font-bold ${s.c}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6 space-y-2">
        {projects.map((p,i)=>(
          <div key={i} className="px-4 py-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] text-[var(--color-foreground)]">{p.name}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>{p.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-green-400">{p.value}</span>
                <span className="text-[11px] text-[var(--color-muted-foreground)]">Due {p.due}</span>
                <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]"/>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{width:`${p.progress}%`}}/></div>
              <span className="text-[11px] text-[var(--color-muted-foreground)] shrink-0">{p.progress}% · {p.phase}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
