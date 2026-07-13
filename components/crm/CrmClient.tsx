"use client";
import * as React from "react";
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const contacts = [
  { name:"Sarah Mitchell", company:"Apex Realty Group", email:"sarah@apexrealty.com", phone:"+1 (555) 201-4832", status:"Active", type:"Client", avatar:"SM" },
  { name:"James Rodriguez", company:"Metro Concrete Co", email:"james@metroconcrete.com", phone:"+1 (555) 387-9201", status:"Prospect", type:"Lead", avatar:"JR" },
  { name:"Emily Chen", company:"FloorTech Industries", email:"emily@floortech.com", phone:"+1 (555) 654-0127", status:"Active", type:"Client", avatar:"EC" },
  { name:"Marcus Thompson", company:"Urban Build Partners", email:"marcus@urbanbuild.com", phone:"+1 (555) 921-3456", status:"Inactive", type:"Partner", avatar:"MT" },
  { name:"Olivia Park", company:"Horizon Contractors", email:"olivia@horizonco.com", phone:"+1 (555) 445-7832", status:"Active", type:"Client", avatar:"OP" },
];

const statusColor: Record<string,string> = {
  Active:"bg-green-500/15 text-green-400 border-green-500/20",
  Prospect:"bg-amber-500/15 text-amber-400 border-amber-500/20",
  Inactive:"bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] border-[var(--color-border)]",
};

export default function CrmClient() {
  const [search, setSearch] = React.useState("");
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><Users className="w-5 h-5 text-[var(--color-primary)]" /> Contacts</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{filtered.length} contacts in your CRM</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Contact</Button>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {[{label:"Total Contacts",val:contacts.length,color:"text-[var(--color-foreground)]"},{label:"Active",val:contacts.filter(c=>c.status==="Active").length,color:"text-green-400"},{label:"Prospects",val:contacts.filter(c=>c.status==="Prospect").length,color:"text-amber-400"},{label:"Partners",val:contacts.filter(c=>c.type==="Partner").length,color:"text-[var(--color-primary)]"}].map(s=>(
          <Card key={s.label} className="bg-[var(--color-card)] border-[var(--color-border)]"><CardContent className="p-4"><div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{s.label}</div><div className={`text-[26px] font-bold ${s.color}`}>{s.val}</div></CardContent></Card>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="relative max-w-xs mb-4"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" /><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts..." className="pl-8 h-8 text-[13px] bg-[var(--color-surface-2)] border-[var(--color-border)]" /></div>
        <div className="grid gap-2">
          {filtered.map((c,i)=>(
            <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] text-[12px] font-bold shrink-0">{c.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[13px] text-[var(--color-foreground)]">{c.name}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-2"><Building2 className="w-3 h-3" />{c.company}</div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[var(--color-muted-foreground)]">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[c.status]}`}>{c.status}</span>
              <MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
