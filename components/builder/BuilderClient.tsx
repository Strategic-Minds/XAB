"use client";
import * as React from "react";
import { Hammer, Plus, Play, Clock, CheckCircle2, AlertCircle, GitBranch, Bot, Globe, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const buildTypes = [
  { icon: Bot, label:"Agent Factory", desc:"Deploy autonomous AI agents with custom tools and memory", color:"text-indigo-400", bg:"bg-indigo-500/10", href:"/agent-factory" },
  { icon: Globe, label:"Website Factory", desc:"Generate full-stack websites from a single prompt", color:"text-blue-400", bg:"bg-blue-500/10", href:"/website-factory" },
  { icon: Workflow, label:"Workflow Factory", desc:"Build multi-step automation workflows visually", color:"text-purple-400", bg:"bg-purple-500/10", href:"/workflow-factory" },
  { icon: GitBranch, label:"Funnel Builder", desc:"Create conversion funnels with AI-optimized copy", color:"text-green-400", bg:"bg-green-500/10", href:"/funnels" },
];

const recentBuilds = [
  { name:"National Epoxy Pros", type:"Website", status:"Live", time:"2h ago" },
  { name:"Lead Qualification Agent", type:"Agent", status:"Running", time:"5h ago" },
  { name:"Outreach Sequence", type:"Workflow", status:"Paused", time:"1d ago" },
  { name:"Demo Request Funnel", type:"Funnel", status:"Live", time:"2d ago" },
];

const statusIcons: Record<string, React.ReactNode> = {
  Live:<CheckCircle2 className="w-3.5 h-3.5 text-green-400"/>,
  Running:<Play className="w-3.5 h-3.5 text-indigo-400"/>,
  Paused:<Clock className="w-3.5 h-3.5 text-amber-400"/>,
  Error:<AlertCircle className="w-3.5 h-3.5 text-red-400"/>,
};

export default function BuilderClient() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Hammer className="w-5 h-5 text-[var(--color-primary)]" /> Builder</h1>
        <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">Build agents, websites, workflows, and funnels with AI</p>
      </div>
      <div className="px-6 py-6 grid grid-cols-2 gap-4">
        {buildTypes.map((bt,i)=>(
          <a key={i} href={bt.href} className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-[var(--color-primary)]/40 transition-all cursor-pointer block">
            <div className={`w-10 h-10 rounded-lg ${bt.bg} flex items-center justify-center mb-3`}><bt.icon className={`w-5 h-5 ${bt.color}`}/></div>
            <div className="font-semibold text-[14px] text-[var(--color-foreground)] mb-1">{bt.label}</div>
            <div className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">{bt.desc}</div>
            <div className={`mt-3 text-[12px] font-medium ${bt.color} flex items-center gap-1`}>Launch <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span></div>
          </a>
        ))}
      </div>
      <div className="px-6 pb-6">
        <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
          <CardHeader className="pb-3 pt-4 px-5"><CardTitle className="text-[14px] font-semibold text-[var(--color-foreground)]">Recent Builds</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {recentBuilds.map((b,i)=>(
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50 last:border-0">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-foreground)]">{b.name}</div>
                    <div className="text-[11px] text-[var(--color-muted-foreground)]">{b.type} · {b.time}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {statusIcons[b.status]}
                    <span className="text-[12px] text-[var(--color-muted-foreground)]">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
