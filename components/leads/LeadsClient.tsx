"use client";
import * as React from "react";
import { TrendingUp, Plus, Search, Filter, Mail, Phone, MoreHorizontal, ChevronRight, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const stages = ["New","Contacted","Qualified","Proposal","Won","Lost"];
const leads = [
  { name:"Apex Realty Group", contact:"James Holt", email:"james@apexrealty.com", value:"$12,400", stage:"Proposal", score:87, updated:"2h ago" },
  { name:"Metro Concrete Co", contact:"Sara Kim", email:"sara@metroconcrete.com", value:"$8,200", stage:"Qualified", score:74, updated:"5h ago" },
  { name:"FloorTech Industries", contact:"Mike Torres", email:"mike@floortech.com", value:"$31,000", stage:"New", score:62, updated:"1d ago" },
  { name:"Urban Build Partners", contact:"Lisa Chen", email:"lisa@urbanbuild.com", value:"$19,500", stage:"Contacted", score:91, updated:"3h ago" },
  { name:"Horizon Contractors", contact:"Ben Walsh", email:"ben@horizonco.com", value:"$7,800", stage:"Won", score:95, updated:"2d ago" },
  { name:"Pacific Floor Systems", contact:"Amy Park", email:"amy@pacificfloor.com", value:"$22,100", stage:"Proposal", score:78, updated:"6h ago" },
];

const stageColors: Record<string,string> = {
  New:"bg-blue-500/15 text-blue-400 border-blue-500/20",
  Contacted:"bg-amber-500/15 text-amber-400 border-amber-500/20",
  Qualified:"bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  Proposal:"bg-purple-500/15 text-purple-400 border-purple-500/20",
  Won:"bg-green-500/15 text-green-400 border-green-500/20",
  Lost:"bg-red-500/15 text-red-400 border-red-500/20",
};

export default function LeadsClient() {
  const [search, setSearch] = React.useState("");
  const filtered = leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase()));
  const totalValue = filtered.reduce((a,l) => a + parseInt(l.value.replace(/[$,]/g,"")), 0);

  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" /> Lead Pipeline
          </h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">{filtered.length} leads · ${totalValue.toLocaleString()} total value</p>
        </div>
        <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Lead
        </Button>
      </div>

      {/* Stage summary */}
      <div className="px-6 py-4 grid grid-cols-6 gap-3">
        {stages.map(s => {
          const count = leads.filter(l => l.stage === s).length;
          return (
            <Card key={s} className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardContent className="p-3">
                <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border inline-flex mb-2 ${stageColors[s]}`}>{s}</div>
                <div className="text-[22px] font-bold text-[var(--color-foreground)]">{count}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)]">leads</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + table */}
      <div className="px-6 pb-6">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads..." className="pl-8 h-8 text-[13px] bg-[var(--color-surface-2)] border-[var(--color-border)]" />
          </div>
          <Button variant="outline" className="h-8 px-3 text-[13px] border-[var(--color-border)] gap-1.5"><Filter className="w-3.5 h-3.5"/>Filter</Button>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
              <tr>{["Company","Contact","Value","Stage","Score","Updated",""].map(h=><th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((l,i)=>(
                <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">{l.name}</td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{l.contact}</td>
                  <td className="px-4 py-3 font-semibold text-green-400">{l.value}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${stageColors[l.stage]}`}>{l.stage}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[var(--color-surface-3)] overflow-hidden"><div className="h-full bg-[var(--color-primary)] rounded-full" style={{width:`${l.score}%`}}/></div>
                      <span className="text-[var(--color-muted-foreground)]">{l.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{l.updated}</td>
                  <td className="px-4 py-3"><MoreHorizontal className="w-4 h-4 text-[var(--color-muted-foreground)]"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
