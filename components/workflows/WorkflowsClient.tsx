"use client";
import * as React from "react";
import { Workflow, Plus, Play, Pause, CheckCircle2, Clock, MoreHorizontal, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const workflows = [
  { name:"New Lead → Qualify → Outreach", trigger:"Lead Created", steps:6, runs:1847, status:"Active", lastRun:"2m ago" },
  { name:"Proposal Follow-up Sequence", trigger:"Proposal Sent", steps:4, runs:392, status:"Active", lastRun:"1h ago" },
  { name:"Weekly Revenue Report", trigger:"Schedule (Mon 9am)", steps:3, runs:48, status:"Active", lastRun:"3d ago" },
  { name:"Competitor Monitor", trigger:"Schedule (Daily)", steps:5, runs:302, status:"Active", lastRun:"6h ago" },
  { name:"Client Onboarding", trigger:"Deal Won", steps:8, runs:67, status:"Paused", lastRun:"5d ago" },
  { name:"Review Request", trigger:"Project Completed", steps:2, runs:124, status:"Active", lastRun:"2d ago" },
];

export default function WorkflowsClient() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Workflow className="w-5 h-5 text-[var(--color-primary)]" /> Workflow Factory</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{workflows.filter(w=>w.status==="Active").length} active · {workflows.reduce((s,w)=>s+w.runs,0).toLocaleString()} total runs</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>New Workflow</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{l:"Total",v:workflows.length,c:"text-[var(--color-foreground)]"},{l:"Active",v:workflows.filter(w=>w.status==="Active").length,c:"text-green-400"},{l:"Total Runs",v:workflows.reduce((s,w)=>s+w.runs,0).toLocaleString(),c:"text-[var(--color-primary)]"},{l:"Avg Steps",v:Math.round(workflows.reduce((s,w)=>s+w.steps,0)/workflows.length),c:"text-amber-400"}].map(s=>(
          <Card key={s.l} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.l}</div><div className={`text-[26px] font-bold ${s.c}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6 space-y-2">
        {workflows.map((w,i)=>(
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors">
            <div className={`w-2 h-2 rounded-full shrink-0 ${w.status==="Active"?"bg-green-400 animate-pulse":"bg-amber-400"}`}/>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px] text-[var(--color-foreground)]">{w.name}</div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-2 mt-0.5">
                <Zap className="w-3 h-3"/>{w.trigger} · {w.steps} steps · last run {w.lastRun}
              </div>
            </div>
            <div className="text-[12px] text-[var(--color-muted-foreground)]">{w.runs.toLocaleString()} runs</div>
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] border-[var(--color-border)]">
              {w.status==="Active"?<Pause className="w-3 h-3"/>:<Play className="w-3 h-3"/>}
            </Button>
            <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)] cursor-pointer"/>
          </div>
        ))}
      </div>
    </div>
  );
}
