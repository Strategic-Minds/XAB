"use client";

import * as React from "react";
import {
  GitBranch, Plus, Filter, Search,
  TrendingUp, DollarSign, Flame, AlertCircle,
  CheckCircle2, Building2, MoreHorizontal, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: number;
  company: string;
  contact: string;
  initials: string;
  value: number;
  daysInStage: number;
  stage: string;
  priority: "Hot" | "Warm" | "Cold";
  owner: string;
  inSequence: boolean;
}

const stages = [
  { name: "New Lead", color: "border-blue-500/30" },
  { name: "Contacted", color: "border-indigo-500/30" },
  { name: "Qualified", color: "border-purple-500/30" },
  { name: "Proposal Sent", color: "border-amber-500/30" },
  { name: "Negotiation", color: "border-orange-500/30" },
  { name: "Closed Won", color: "border-green-500/30" },
  { name: "Closed Lost", color: "border-red-500/30" },
];

const deals: Deal[] = [
  { id:1, company:"Apex Realty Group", contact:"Sarah Mitchell", initials:"SM", value:28000, daysInStage:2, stage:"New Lead", priority:"Hot", owner:"Jeremy", inSequence:true },
  { id:2, company:"Metro Concrete Co", contact:"James Rodriguez", initials:"JR", value:14500, daysInStage:5, stage:"New Lead", priority:"Warm", owner:"Jeremy", inSequence:false },
  { id:3, company:"FloorTech Industries", contact:"Emily Chen", initials:"EC", value:42000, daysInStage:3, stage:"Contacted", priority:"Hot", owner:"Jeremy", inSequence:true },
  { id:4, company:"Urban Build Partners", contact:"Marcus Thompson", initials:"MT", value:8200, daysInStage:8, stage:"Contacted", priority:"Cold", owner:"Jeremy", inSequence:false },
  { id:5, company:"Pacific Floor Systems", contact:"Olivia Park", initials:"OP", value:31000, daysInStage:1, stage:"Qualified", priority:"Hot", owner:"Jeremy", inSequence:true },
  { id:6, company:"Horizon Contractors", contact:"Ben Walsh", initials:"BW", value:19500, daysInStage:4, stage:"Qualified", priority:"Warm", owner:"Jeremy", inSequence:true },
  { id:7, company:"Summit Polishing Co", contact:"Diana Lee", initials:"DL", value:23000, daysInStage:6, stage:"Proposal Sent", priority:"Warm", owner:"Jeremy", inSequence:false },
  { id:8, company:"Granite Pro Services", contact:"Tom Baker", initials:"TB", value:11000, daysInStage:9, stage:"Proposal Sent", priority:"Cold", owner:"Jeremy", inSequence:false },
  { id:9, company:"Elite Epoxy Phoenix", contact:"Rachel Kim", initials:"RK", value:45000, daysInStage:2, stage:"Negotiation", priority:"Hot", owner:"Jeremy", inSequence:true },
  { id:10, company:"National Floor Corp", contact:"Chris Adams", initials:"CA", value:38000, daysInStage:3, stage:"Negotiation", priority:"Hot", owner:"Jeremy", inSequence:true },
  { id:11, company:"Desert Concrete LLC", contact:"Amy Johnson", initials:"AJ", value:16800, daysInStage:0, stage:"Closed Won", priority:"Hot", owner:"Jeremy", inSequence:false },
  { id:12, company:"Pro Polish Group", contact:"David Miller", initials:"DM", value:9400, daysInStage:12, stage:"Closed Lost", priority:"Cold", owner:"Jeremy", inSequence:false },
];

const priorityConfig = {
  Hot: { color: "bg-red-500/15 text-red-400 border-red-500/20", dot: "bg-red-400" },
  Warm: { color: "bg-amber-500/15 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
  Cold: { color: "bg-blue-500/15 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
};

function DealCard({ deal }: { deal: Deal }) {
  const pc = priorityConfig[deal.priority];
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 mb-2 hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] shrink-0">
            {deal.initials}
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--color-foreground)] leading-none">{deal.company}</div>
            <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">{deal.contact}</div>
          </div>
        </div>
        <MoreHorizontal className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-green-400">${deal.value.toLocaleString()}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pc.color}`}>{deal.priority}</span>
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-[var(--color-muted-foreground)]">
        <span>{deal.daysInStage}d in stage</span>
        {deal.inSequence && <span className="text-indigo-400 font-medium">In sequence</span>}
      </div>
    </div>
  );
}

export default function PipelineClient() {
  const [search, setSearch] = React.useState("");
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);
  const activeDeals = deals.filter(d => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const weightedForecast = Math.round(activeDeals.reduce((s, d) => {
    const weights: Record<string, number> = { "New Lead": 0.1, "Contacted": 0.2, "Qualified": 0.4, "Proposal Sent": 0.6, "Negotiation": 0.8 };
    return s + d.value * (weights[d.stage] || 0);
  }, 0));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-background)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[var(--color-primary)]" /> Sales Pipeline
          </h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">
            {deals.length} deals · ${totalValue.toLocaleString()} total · ${weightedForecast.toLocaleString()} weighted forecast
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..." className="pl-8 h-8 text-[13px] w-48 bg-[var(--color-surface-2)] border-[var(--color-border)]" />
          </div>
          <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-8 px-3 text-[13px] gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-3 flex items-center gap-6 border-b border-[var(--color-border)] shrink-0">
        {[
          { label: "Total Pipeline", val: `$${totalValue.toLocaleString()}`, color: "text-[var(--color-foreground)]" },
          { label: "Weighted Forecast", val: `$${weightedForecast.toLocaleString()}`, color: "text-indigo-400" },
          { label: "Closed Won", val: `$${wonValue.toLocaleString()}`, color: "text-green-400" },
          { label: "Active Deals", val: activeDeals.length, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label}>
            <div className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{s.label}</div>
            <div className={`text-[16px] font-bold ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full" style={{ minWidth: `${stages.length * 220}px` }}>
          {stages.map(stage => {
            const stageDeals = deals.filter(d =>
              d.stage === stage.name &&
              (search === "" || d.company.toLowerCase().includes(search.toLowerCase()) || d.contact.toLowerCase().includes(search.toLowerCase()))
            );
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            return (
              <div key={stage.name} className={`flex flex-col w-[210px] shrink-0 rounded-xl border ${stage.color} bg-[var(--color-card)] overflow-hidden`}>
                <div className="px-3 py-2.5 border-b border-[var(--color-border)]">
                  <div className="text-[11px] font-semibold text-[var(--color-foreground)]">{stage.name}</div>
                  <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5">
                    {stageDeals.length} deals · ${stageValue.toLocaleString()}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {stageDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                  {stageDeals.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-[var(--color-muted-foreground)]">No deals</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
