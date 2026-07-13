"use client";

import * as React from "react";
import { 
  GitBranch, Plus, Filter, Search, Calendar, ChevronDown, 
  TrendingUp, BarChart2, Mail, Phone, Flame, Alert
  Briefcase, Check2, User, BuildingDollarSign,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Deal {
  id: string;
  companyName: string;
  contactName: string;
  value: number;
  stage: string;
  daysInStage: number;
  owner: string;
  priority: "Hot" | "Warm" | "Cold";
  sequenceEnrolled: boolean;
}

const initialDeals: Deal[] = [
  { id: "1", companyName: "Apex Flooring Partners", contactName: "Marcus Vance", value: 35000, stage: "New Lead", daysInStage: 2, owner: "Sarah Jenkins", priority: "Hot", sequenceEnrolled: true },
  { id: "2", companyName: "Vanguard Epoxy Systems", contactName: "Elena Rostova", value: 45000, stage: "New Lead", daysInStage: 4, owner: "Michael Chang", priority: "Hot", sequenceEnrolled: true },
  { id: "3", companyName: "Summit Concrete Solutions", contactName: "John Miller", value: 18000, stage: "New Lead", daysInStage: 1, owner: "Sarah Jenkins", priority: "Warm", sequenceEnrolled: false },
  { id: "4", companyName: "Titan Industrial Coatings", contactName: "Dave Batista", value: 28000, stage: "Contacted", daysInStage: 5, owner: "Emma Watson", priority: "Hot", sequenceEnrolled: true },
  { id: "5", companyName: "Blue Pacific Construction", contactName: "Alan Shore", value: 12000, stage: "Contacted", daysInStage: 9, owner: "Michael Chang", priority: "Warm", sequenceEnrolled: true },
  { id: "6", companyName: "NextGen Warehouses", contactName: "Sarah Connor", value: 32000, stage: "Contacted", daysInStage: 11, owner: "Sarah Jenkins", priority: "Cold", sequenceEnrolled: false },
  { id: "7", companyName: "Dallas Epoxy Tech", contactName: "Ryan Reynolds", value: 15000, stage: "Qualified", daysInStage: 3, owner: "Emma Watson", priority: "Hot", sequenceEnrolled: true },
  { id: "8", companyName: "Empire Building Group", contactName: "Christian Bale", value: 42000, stage: "Qualified", daysInStage: 8, owner: "Michael Chang", priority: "Hot", sequenceEnrolled: true },
  { id: "9", companyName: "Metro Floor Installers", contactName: "Peter Parker", value: 8500, stage: "Qualified", daysInStage: 14, owner: "Sarah Jenkins", priority: "Cold", sequenceEnrolled: false },
  { id: "10", companyName: "Oakridge Real Estate", contactName: "Bruce Wayne", value: 25000, stage: "Proposal Sent", daysInStage: 6, owner: "Emma Watson", priority: "Hot", sequenceEnrolled: false },
  { id: "11", companyName: "Precision Epoxy Design", contactName: "Tony Stark", value: 22000, stage: "Proposal Sent", daysInStage: 12, owner: "Michael Chang", priority: "Warm", sequenceEnrolled: true },
  { id: "12", companyName: "Greenfield Contractors", contactName: "Clark Kent", value: 9500, stage: "Proposal Sent", daysInStage: 15, owner: "Sarah Jenkins", priority: "Cold", sequenceEnrolled: false },
  { id: "13", companyName: "Superior Resins & Floors", contactName: "Diana Prince", value: 38000, stage: "Negotiation", daysInStage: 4, owner: "Emma Watson", priority: "Hot", sequenceEnrolled: true },
  { id: "14", companyName: "Pinnacle Concrete Group", contactName: "Barry Allen", value: 17500, stage: "Negotiation", daysInStage: 10, owner: "Michael Chang", priority: "Warm", sequenceEnrolled: false },
  { id: "15", companyName: "Nexus Flooring Labs", contactName: "Wanda Maximoff", value: 29000, stage: "Negotiation", daysInStage: 21, owner: "Sarah Jenkins", priority: "Cold", sequenceEnrolled: true },
  { id: "16", companyName: "Apex Epoxy Specialists", contactName: "Arthur Curry", value: 31000, stage: "Closed Won", daysInStage: 18, owner: "Emma Watson", priority: "Hot", sequenceEnrolled: false },
  { id: "17", companyName: "Starlight Real Estate", contactName: "Selina Kyle", value: 14000, stage: "Closed Won", daysInStage: 25, owner: "Michael Chang", priority: "Warm", sequenceEnrolled: false },
  { id: "18", companyName: "Anchor Industrial Floors", contactName: "Victor Stone", value: 26000, stage: "Closed Lost", daysInStage: 30, owner: "Sarah Jenkins", priority: "Cold", sequenceEnrolled: false }
];

const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

export default function PipelineClient() {
  const [deals, setDeals] = React.useState<Deal[]>(initialDeals);
  const [filterOwner, setFilterOwner] = React.useState<string>("All");
  const [filterPriority, setFilterPriority] = React.useState<string>("All");
  const [minValue, setMinValue] = React.useState<number>(0);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Form State
  const [newCompany, setNewCompany] = React.useState("");
  const [newContact, setNewContact] = React.useState("");
  const [newValue, setNewValue] = React.useState("");
  const [newStage, setNewStage] = React.useState("New Lead");
  const [newPriority, setNewPriority] = React.useState<"Hot" | "Warm" | "Cold">("Warm");
  const [newOwner, setNewOwner] = React.useState("Sarah Jenkins");

  const owners = Array.from(new Set(deals.map(d => d.owner)));

  const filteredDeals = deals.filter(deal => {
    if (filterOwner !== "All" && deal.owner !== filterOwner) return false;
    if (filterPriority !== "All" && deal.priority !== filterPriority) return false;
    if (deal.value < minValue) return false;
    return true;
  });

  const totalValue = filteredDeals.reduce((sum, deal) => deal.stage !== "Closed Lost" ? sum + deal.value : sum, 0);

  // Weighted forecast based on conversion probability of stages
  const getStageProbability = (stage: string) => {
    switch (stage) {
      case "New Lead": return 0.1;
      case "Contacted": return 0.2;
      case "Qualified": return 0.4;
      case "Proposal Sent": return 0.6;
      case "Negotiation": return 0.8;
      case "Closed Won": return 1.0;
      default: return 0.0;
    }
  };

  const weightedForecast = filteredDeals.reduce((sum, deal) => {
    return sum + deal.value * getStageProbability(deal.stage);
  }, 0);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Hot": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Warm": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Cold": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newContact || !newValue) return;

    const deal: Deal = {
      id: Date.now().toString(),
      companyName: newCompany,
      contactName: newContact,
      value: parseFloat(newValue) || 0,
      stage: newStage,
      daysInStage: 1,
      owner: newOwner,
      priority: newPriority,
      sequenceEnrolled: false
    };

    setDeals([deal, ...deals]);
    setIsAddOpen(false);

    // Reset Form
    setNewCompany("");
    setNewContact("");
    setNewValue("");
    setNewStage("New Lead");
    setNewPriority("Warm");
    setNewOwner("Sarah Jenkins");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex-1 overflow-auto bg-black text-white p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-indigo-400 bg-clip-text text-transparent">
              CRM Deals Pipeline
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Apollo-style multi-stage sales tracking with weighted forecasting and sequences integration.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium shadow-md shadow-indigo-600/20 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border border-neutral-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Create New Deal</DialogTitle>
              <DialogDescription className="text-neutral-400 text-xs">
                Add a qualified lead or ongoing sales opportunity to your pipeline tracking system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDeal} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Apex Industrial Epoxy"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-300">Contact Name</label>
                <input
                  type="text"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Robert Smith"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-300">Deal Value ($)</label>
                <input
                  type="number"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 15000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-neutral-300">Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-neutral-300">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">⚡ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-300">Deal Owner</label>
                <select
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Michael Chang">Michael Chang</option>
                  <option value="Emma Watson">Emma Watson</option>
                </select>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
                  Save Opportunity
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.03] border-white/5 shadow-inner">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400">Total Active Pipeline</span>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 shadow-inner">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400">Weighted Forecast</span>
              <p className="text-2xl font-bold text-indigo-400">{formatCurrency(weightedForecast)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 shadow-inner">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400">Opportunities Loaded</span>
              <p className="text-2xl font-bold text-white">{filteredDeals.length} deals</p>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-500/10 border border-neutral-500/20">
              <Briefcase className="w-5 h-5 text-neutral-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardContent className="p-3 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="bg-black border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="All">All Owners</option>
              {owners.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-black border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">⚡ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-neutral-500 font-medium">Min Deal Value:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50000"
                step="5000"
                value={minValue}
                onChange={(e) => setMinValue(Number(e.target.value))}
                className="w-24 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="font-mono text-indigo-400 font-bold">{formatCurrency(minValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage);
          const stageSum = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div 
              key={stage} 
              className="w-72 shrink-0 bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-neutral-200 tracking-tight flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-current inline-block" />
                    {stage}
                  </h3>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">
                    {stageDeals.length} {stageDeals.length === 1 ? "Deal" : "Deals"}
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-neutral-300 font-bold bg-neutral-900/50 border-white/5">
                  {formatCurrency(stageSum)}
                </Badge>
              </div>

              {/* Deal Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                {stageDeals.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border border-dashed border-white/[0.03] rounded-lg text-neutral-600 text-center px-4">
                    <AlertclassName="w-4 h-4 mb-1.5 opacity-50" />
                    <span className="text-[10px] font-medium">No opportunities</span>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.05] hover:border-indigo-500/20 rounded-xl p-3 space-y-3 transition-all duration-200 cursor-pointer shadow-md shadow-black/40 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[170px]">
                            {deal.companyName}
                          </h4>
                          <Badge className={`text-[9px] px-1.5 py-0 rounded font-semibold border ${getPriorityColor(deal.priority)}`}>
                            {deal.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/10 text-indigo-300 flex items-center justify-center font-bold text-[8px]">
                            {deal.contactName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="truncate max-w-[180px]">{deal.contactName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/[0.04] pt-2 text-[10px] text-neutral-400">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white font-mono">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-medium">Value</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="font-mono text-neutral-300 font-semibold">
                            {deal.daysInStage}d
                          </span>
                          <span className="text-[9px] text-neutral-500 font-medium">In stage</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-dashed border-white/[0.04] text-[9px]">
                        <span className="text-neutral-500 flex items-center gap-1">
                          <User className="w-3 h-3 text-neutral-600" />
                          {deal.owner.split(" ")[0]}
                        </span>
                        {deal.sequenceEnrolled && (
                          <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 rounded-full px-1.5 py-0.5 font-semibold text-[8px] flex items-center gap-0.5">
                            <Mail className="w-2.5 h-2.5" /> Enrolled
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
