"use client";
import * as React from "react";
import { Bot, Plus, Play, Pause, MoreHorizontal, Zap, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const agents = [
  { name:"Lead Qualifier", desc:"Scores and qualifies inbound leads via AI", status:"Running", tasks:847, success:98, model:"GPT-4o" },
  { name:"Outreach Agent", desc:"Sends personalized WhatsApp & email sequences", status:"Running", tasks:2341, success:94, model:"Claude 3.5" },
  { name:"SEO Ghost Writer", desc:"Generates optimized content for 70 city sites", status:"Paused", tasks:156, success:99, model:"GPT-4o" },
  { name:"Deal Closer", desc:"Follows up on proposals and negotiates closes", status:"Running", tasks:412, success:91, model:"GPT-4o" },
  { name:"Support Agent", desc:"Handles customer support tickets automatically", status:"Idle", tasks:89, success:96, model:"Claude 3.5" },
  { name:"Intelligence Scout", desc:"Monitors competitors and market signals", status:"Running", tasks:1203, success:100, model:"Gemini Pro" },
];

const statusConfig: Record<string, {icon:React.ReactNode, color:string, dot:string}> = {
  Running:{ icon:<Play className="w-3 h-3"/>, color:"text-green-400", dot:"bg-green-400" },
  Paused:{ icon:<Pause className="w-3 h-3"/>, color:"text-amber-400", dot:"bg-amber-400" },
  Idle:{ icon:<Clock className="w-3 h-3"/>, color:"text-[var(--color-muted-foreground)]", dot:"bg-[var(--color-muted-foreground)]" },
};

export default function AgentsClient() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Bot className="w-5 h-5 text-[var(--color-primary)]" /> Agent Factory</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{agents.filter(a=>a.status==="Running").length} agents running · {agents.reduce((s,a)=>s+a.tasks,0).toLocaleString()} total tasks completed</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>Deploy Agent</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{l:"Total Agents",v:agents.length,c:"text-[var(--color-foreground)]"},{l:"Running",v:agents.filter(a=>a.status==="Running").length,c:"text-green-400"},{l:"Tasks Today",v:"4,891",c:"text-[var(--color-primary)]"},{l:"Avg Success",v:"96%",c:"text-amber-400"}].map(s=>(
          <Card key={s.l} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.l}</div><div className={`text-[26px] font-bold ${s.c}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6 grid grid-cols-2 gap-3">
        {agents.map((a,i)=>{
          const sc = statusConfig[a.status];
          return (
            <Card key={i} className="bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center"><Bot className="w-4 h-4 text-[var(--color-primary)]"/></div>
                    <div>
                      <div className="font-semibold text-[13px] text-[var(--color-foreground)]">{a.name}</div>
                      <div className="text-[11px] text-[var(--color-muted-foreground)]">{a.model}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-medium ${sc.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${a.status==="Running"?"animate-pulse":""}`}/>
                    {a.status}
                  </div>
                </div>
                <p className="text-[12px] text-[var(--color-muted-foreground)] mb-3 leading-relaxed">{a.desc}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-muted-foreground)]">{a.tasks.toLocaleString()} tasks</span>
                  <span className="text-green-400 font-semibold">{a.success}% success</span>
                  <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)] cursor-pointer"/>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
