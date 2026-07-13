"use client";
import * as React from "react";
import { Mail, Plus, Send, Clock, CheckCircle2, Phone, MessageSquare, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const queue = [
  { name:"Mike Torres", company:"FloorTech Industries", platform:"WhatsApp", campaign:"PCU Alumni Outreach", status:"Queued", scheduled:"Today 2:00 PM" },
  { name:"Sara Kim", company:"Metro Concrete", platform:"Email", campaign:"Demo Follow-up", status:"Sent", scheduled:"2h ago" },
  { name:"James Holt", company:"Apex Realty", platform:"SMS", campaign:"Proposal Follow-up", status:"Replied", scheduled:"5h ago" },
  { name:"Lisa Chen", company:"Urban Build", platform:"WhatsApp", campaign:"PCU Alumni Outreach", status:"Queued", scheduled:"Today 3:30 PM" },
  { name:"Ben Walsh", company:"Horizon Contractors", platform:"Email", campaign:"Win-back", status:"Sent", scheduled:"1d ago" },
];

const platformIcon: Record<string, React.ReactNode> = {
  WhatsApp:<MessageSquare className="w-3.5 h-3.5 text-green-400"/>,
  Email:<Mail className="w-3.5 h-3.5 text-blue-400"/>,
  SMS:<Phone className="w-3.5 h-3.5 text-purple-400"/>,
};
const statusColor: Record<string,string> = {
  Queued:"bg-amber-500/15 text-amber-400",
  Sent:"bg-blue-500/15 text-blue-400",
  Replied:"bg-green-500/15 text-green-400",
  Failed:"bg-red-500/15 text-red-400",
};

export default function OutreachClient() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Mail className="w-5 h-5 text-[var(--color-primary)]" /> Outreach</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{queue.filter(q=>q.status==="Queued").length} queued · {queue.filter(q=>q.status==="Replied").length} replies received</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5"/>New Campaign</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{l:"Queued",v:queue.filter(q=>q.status==="Queued").length,c:"text-amber-400"},{l:"Sent",v:queue.filter(q=>q.status==="Sent").length,c:"text-blue-400"},{l:"Replied",v:queue.filter(q=>q.status==="Replied").length,c:"text-green-400"},{l:"Reply Rate",v:"33%",c:"text-[var(--color-primary)]"}].map(s=>(
          <Card key={s.l} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.l}</div><div className={`text-[26px] font-bold ${s.c}`}>{s.v}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6 space-y-2">
        {queue.map((q,i)=>(
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px] text-[var(--color-foreground)]">{q.name} <span className="text-[var(--color-muted-foreground)] font-normal">· {q.company}</span></div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">{q.campaign} · {q.scheduled}</div>
            </div>
            <div className="flex items-center gap-1">{platformIcon[q.platform]}<span className="text-[12px] text-[var(--color-muted-foreground)]">{q.platform}</span></div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[q.status]}`}>{q.status}</span>
            <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)] cursor-pointer"/>
          </div>
        ))}
      </div>
    </div>
  );
}
