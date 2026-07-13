"use client";

import * as React from "react";
import { 
  BarChart2, Sparkles, RefreshCw, Sliders, ChevronDown, CheckCircle, 
  Activity, Users, Settings, Briefcase, MailOpen, CornerUpLeft, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  company_size: string;
  last_activity_days: number;
  email_opens: number;
  replied: boolean;
  score?: number;
  signals?: string[];
  action?: string;
}

const initialContacts: Contact[] = [
  { id: "1", name: "Sarah Connor", title: "VP of Construction Operations", company: "Titan Industrial Coatings", industry: "Construction", company_size: "51-200", last_activity_days: 2, email_opens: 6, replied: true },
  { id: "2", name: "John Miller", title: "Founder & CEO", company: "Summit Concrete Solutions", industry: "Concrete", company_size: "11-50", last_activity_days: 5, email_opens: 8, replied: true },
  { id: "3", name: "Marcus Vance", title: "Director of Flooring", company: "Apex Flooring Partners", industry: "Flooring", company_size: "201-500", last_activity_days: 3, email_opens: 5, replied: false },
  { id: "4", name: "Elena Rostova", title: "Head of Procurement", company: "Vanguard Epoxy Systems", industry: "Epoxy", company_size: "51-200", last_activity_days: 4, email_opens: 4, replied: false },
  { id: "5", name: "Dave Batista", title: "President", company: "Blue Pacific Construction", industry: "Construction", company_size: "51-200", last_activity_days: 12, email_opens: 2, replied: false },
  { id: "6", name: "Robert Smith", title: "General Manager", company: "Dallas Epoxy Tech", industry: "Epoxy", company_size: "11-50", last_activity_days: 6, email_opens: 3, replied: true },
  { id: "7", name: "Diana Prince", title: "Owner & CEO", company: "Superior Resins & Floors", industry: "Flooring", company_size: "11-50", last_activity_days: 1, email_opens: 7, replied: true },
  { id: "8", name: "Tony Stark", title: "Vice President", company: "Precision Epoxy Design", industry: "Concrete", company_size: "201-500", last_activity_days: 10, email_opens: 2, replied: false },
  { id: "9", name: "Bruce Wayne", title: "Director", company: "Oakridge Real Estate", industry: "Real Estate", company_size: "51-200", last_activity_days: 8, email_opens: 3, replied: false },
  { id: "10", name: "Barry Allen", title: "Operations Manager", company: "Pinnacle Concrete Group", industry: "Concrete", company_size: "11-50", last_activity_days: 15, email_opens: 1, replied: false },
  { id: "11", name: "Clark Kent", title: "Lead Architect", company: "Greenfield Contractors", industry: "Construction", company_size: "11-50", last_activity_days: 22, email_opens: 0, replied: false },
  { id: "12", name: "Selina Kyle", title: "Acquisition Manager", company: "Starlight Real Estate", industry: "Real Estate", company_size: "201-500", last_activity_days: 3, email_opens: 2, replied: false },
  { id: "13", name: "Arthur Curry", title: "CEO", company: "Apex Epoxy Specialists", industry: "Epoxy", company_size: "11-50", last_activity_days: 28, email_opens: 1, replied: false },
  { id: "14", name: "Wanda Maximoff", title: "VP Operations", company: "Nexus Flooring Labs", industry: "Manufacturing", company_size: "51-200", last_activity_days: 6, email_opens: 4, replied: false },
  { id: "15", name: "Victor Stone", title: "Maintenance Director", company: "Anchor Industrial Floors", industry: "Manufacturing", company_size: "51-200", last_activity_days: 19, email_opens: 2, replied: false }
];

export default function ScoringClient() {
  const [weights, setWeights] = React.useState({
    title: 30,
    industry: 25,
    company_size: 20,
    engagement: 15,
    recency: 10,
  });

  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Score recalculation offline helper that matches API math perfectly
  const recalculateScores = React.useCallback((currentWeights: typeof weights) => {
    const scored = initialContacts.map(contact => {
      let score = 0;
      const signals: string[] = [];

      // Title match
      const seniorTitles = ['ceo','owner','founder','president','director','vp','vice president','manager'];
      if (seniorTitles.some(t => contact.title?.toLowerCase().includes(t))) {
        score += currentWeights.title;
        signals.push("Decision Maker Title");
      }

      // Industry Match
      const targetIndustries = ['construction','flooring','concrete','epoxy','real estate','manufacturing'];
      if (targetIndustries.some(i => contact.industry?.toLowerCase().includes(i))) {
        score += currentWeights.industry;
        signals.push("Target Industry");
      }

      // Company Size Match
      if (['11-50','51-200','201-500'].includes(contact.company_size)) {
        score += currentWeights.company_size;
        signals.push("Ideal Size Fit");
      }

      // Engagement
      if (contact.email_opens > 2) {
        const engScore = Math.min(currentWeights.engagement, contact.email_opens * 3);
        score += engScore;
        signals.push(`High Email Engagement (${contact.email_opens} opens)`);
      }
      if (contact.replied) {
        score += 10;
        signals.push("Replied to Outreach");
      }

      // Recency
      if (contact.last_activity_days < 7) {
        score += currentWeights.recency;
        signals.push("Active Lead (< 7d)");
      } else if (contact.last_activity_days < 30) {
        score += currentWeights.recency * 0.5;
        signals.push("Recent Interest (< 30d)");
      }

      const finalScore = Math.min(100, Math.round(score));

      // Action determination
      let action = "Enroll in Nurture";
      if (finalScore >= 80) action = "Instant Phone Dial & SMS";
      else if (finalScore >= 60) action = "Send Customized Proposal";
      else if (finalScore >= 40) action = "Add to Multi-Channel Campaign";

      return {
        ...contact,
        score: finalScore,
        signals,
        action
      };
    });

    // Sort descending
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scored;
  }, []);

  // Initial calculation
  React.useEffect(() => {
    setContacts(recalculateScores(weights));
  }, [recalculateScores, weights]);

  // Handle server/API recalculate trigger
  const handleRecalculate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/scoring/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: initialContacts, weights })
      });
      const data = await response.json();
      
      // Map API outputs back and supply local signal & action metadata
      const mapped = data.scored.map((c: any) => {
        const localMatched = recalculateScores(weights).find(loc => loc.id === c.id);
        return {
          ...c,
          signals: localMatched?.signals || [],
          action: localMatched?.action || "Enroll in Nurture"
        };
      });

      setContacts(mapped);
    } catch (e) {
      console.error("API scoring failed, falling back to local client calc", e);
      setContacts(recalculateScores(weights));
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-indigo-500";
    return "bg-neutral-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="text-red-400 bg-red-500/10 border-red-500/20 text-[10px]">🔥 High Intent</Badge>;
    if (score >= 60) return <Badge className="text-amber-400 bg-amber-500/10 border-amber-500/20 text-[10px]">⚡ Warm Prospect</Badge>;
    return <Badge className="text-neutral-400 bg-neutral-500/10 border-neutral-500/20 text-[10px]">❄️ Cold Fit</Badge>;
  };

  // Score distribution calculation for bar buckets
  const scoreBuckets = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0
  };

  contacts.forEach(c => {
    const s = c.score || 0;
    if (s <= 20) scoreBuckets["0-20"]++;
    else if (s <= 40) scoreBuckets["21-40"]++;
    else if (s <= 60) scoreBuckets["41-60"]++;
    else if (s <= 80) scoreBuckets["61-80"]++;
    else scoreBuckets["81-100"]++;
  });

  const maxBucketCount = Math.max(...Object.values(scoreBuckets));

  return (
    <div className="flex-1 overflow-auto bg-black text-white p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-indigo-400 bg-clip-text text-transparent">
              AI Lead Scoring Engine
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time intent-fit model matching demographic fit, intent indicators, and engagement signals.
          </p>
        </div>

        <Button 
          onClick={handleRecalculate} 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 text-white font-medium cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Recalculating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" /> Recalculate All
            </>
          )}
        </Button>
      </div>

      {/* Main Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/[0.02] border-white/5 shadow-inner">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sliders className="w-4 h-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                  Model Weight Config
                </CardTitle>
              </div>
              <CardDescription className="text-neutral-500 text-xs">
                Dynamically adjust weight factors. Sum total will prioritize corresponding attributes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Title Fit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Decision Maker Title</span>
                  <span className="font-mono text-indigo-400 font-bold">{weights.title}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.title}
                  onChange={(e) => setWeights({ ...weights, title: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Industry Fit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Target Industry Fit</span>
                  <span className="font-mono text-indigo-400 font-bold">{weights.industry}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.industry}
                  onChange={(e) => setWeights({ ...weights, industry: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Ideal Company Size</span>
                  <span className="font-mono text-indigo-400 font-bold">{weights.company_size}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.company_size}
                  onChange={(e) => setWeights({ ...weights, company_size: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Email opens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Outreach Engagement</span>
                  <span className="font-mono text-indigo-400 font-bold">{weights.engagement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.engagement}
                  onChange={(e) => setWeights({ ...weights, engagement: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Recency */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Activity Recency</span>
                  <span className="font-mono text-indigo-400 font-bold">{weights.recency}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.recency}
                  onChange={(e) => setWeights({ ...weights, recency: Number(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Scoring Signals Guide */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300">Scoring Signals Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-neutral-200">Decision Maker Match</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Title contains CEO, Founder, VP, President, Director, or Owner.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-neutral-200">Target Industry Alignment</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">High fit targets: Construction, Concrete, Flooring, Epoxy, Real Estate, and Mfg.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-neutral-200">Engagement Recency Bonus</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Full weight if activity is within 7 days. Half weight if within 30 days.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Distribution & Table Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Distribution Chart Row */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Lead Score Distribution
                  </CardTitle>
                  <CardDescription className="text-neutral-500 text-[11px] mt-0.5">
                    Count of prospects stratified across score tiers.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] text-neutral-400 font-mono bg-neutral-900/50 border-white/5">
                    Total Contacts: {contacts.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3.5 items-end h-28 pt-2">
                {Object.entries(scoreBuckets).map(([bucket, count]) => {
                  const percent = maxBucketCount > 0 ? (count / maxBucketCount) * 100 : 0;
                  return (
                    <div key={bucket} className="flex flex-col items-center gap-2 group">
                      <div className="w-full bg-neutral-900 border border-white/[0.03] rounded-md h-20 flex items-end overflow-hidden relative">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-300"
                          style={{ height: `${percent || 5}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white z-10">
                          {count}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-semibold tracking-tight">{bucket}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Scored Leads Table */}
          <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.04]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Model Ranked Leads & Action Directives
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-4 w-12 text-center">Rank</th>
                    <th className="p-3.5">Prospect</th>
                    <th className="p-3.5">Company & Size</th>
                    <th className="p-3.5 w-28">Score</th>
                    <th className="p-3.5">Key Match Signals</th>
                    <th className="p-3.5 pr-4 text-right">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-xs">
                  {contacts.map((contact, index) => {
                    const score = contact.score || 0;
                    return (
                      <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 pl-4 text-center font-mono text-neutral-500 font-bold">
                          #{index + 1}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-100">{contact.name}</div>
                          <div className="text-[11px] text-neutral-500 font-medium truncate max-w-[150px] mt-0.5">
                            {contact.title}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-neutral-300">{contact.company}</div>
                          <div className="text-[10px] text-indigo-400 font-mono font-bold mt-0.5">
                            {contact.industry} · {contact.company_size}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold font-mono text-white">{score}</span>
                              {getScoreBadge(score)}
                            </div>
                            <Progress value={score} className="h-1.5" />
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {contact.signals?.slice(0, 2).map((sig) => (
                              <Badge key={sig} variant="outline" className="text-[9px] px-1 py-0 bg-neutral-900 border-white/[0.04] text-neutral-400">
                                {sig}
                              </Badge>
                            ))}
                            {(contact.signals?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-neutral-900 border-white/[0.04] text-indigo-400 font-mono font-bold">
                                +{(contact.signals?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <Badge className="bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold py-1 px-2.5 rounded-full inline-flex items-center gap-1">
                            <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                            {contact.action}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
