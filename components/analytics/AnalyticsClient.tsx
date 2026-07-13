"use client";
import * as React from "react";
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  {month:"Jan",revenue:32000,leads:42},{month:"Feb",revenue:41000,leads:58},{month:"Mar",revenue:38000,leads:51},
  {month:"Apr",revenue:52000,leads:74},{month:"May",revenue:61000,leads:89},{month:"Jun",revenue:58000,leads:82},
  {month:"Jul",revenue:74000,leads:103},{month:"Aug",revenue:69000,leads:97},
];

const kpis = [
  {label:"Revenue (MTD)",val:"$74,000",change:"+18%",up:true},{label:"New Leads",val:"103",change:"+24%",up:true},
  {label:"Conversion Rate",val:"12.4%",change:"+2.1%",up:true},{label:"Avg Deal Size",val:"$8,200",change:"-3%",up:false},
];

export default function AnalyticsClient() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-auto bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4">
        <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[var(--color-primary)]" /> Analytics</h1>
        <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">Revenue and growth metrics</p>
      </div>
      <div className="px-6 py-4 grid grid-cols-4 gap-3">
        {kpis.map(k=>(
          <Card key={k.label} className="bg-[var(--color-card)] border-[var(--color-border)]">
            <CardContent className="p-4">
              <div className="text-[11px] text-[var(--color-muted-foreground)] mb-1">{k.label}</div>
              <div className="text-[24px] font-bold text-[var(--color-foreground)]">{k.val}</div>
              <div className={`text-[12px] font-medium flex items-center gap-1 mt-1 ${k.up?"text-green-400":"text-red-400"}`}>
                {k.up?<TrendingUp className="w-3.5 h-3.5"/>:<TrendingDown className="w-3.5 h-3.5"/>}{k.change} vs last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="px-6 pb-6 grid grid-cols-2 gap-4">
        <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
          <CardHeader className="pb-2 pt-4 px-5"><CardTitle className="text-[14px] font-semibold text-[var(--color-foreground)]">Revenue Trend</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="month" tick={{fill:"#666",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#666",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{background:"#111",border:"1px solid #222",borderRadius:"8px",fontSize:"12px"}}/>
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rv)"/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
          <CardHeader className="pb-2 pt-4 px-5"><CardTitle className="text-[14px] font-semibold text-[var(--color-foreground)]">Lead Volume</CardTitle></CardHeader>
          <CardContent className="px-5 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="month" tick={{fill:"#666",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#666",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#111",border:"1px solid #222",borderRadius:"8px",fontSize:"12px"}}/>
                <Bar dataKey="leads" fill="#6366f1" radius={[4,4,0,0]} fillOpacity={0.8}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
