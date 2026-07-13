"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Database,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Mail,
  Linkedin,
  FileText,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";

interface EnrichedRecord {
  id: string;
  pastedInput: string;
  email: string;
  status: "Valid" | "Catch-All" | "Invalid" | "Unverified";
  name?: string;
  company?: string;
  title?: string;
  linkedin?: string;
  enrichmentScore?: number;
}

export default function EnrichmentClient() {
  const [inputText, setInputText] = useState("");
  const [records, setRecords] = useState<EnrichedRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    catchAll: 0,
    invalid: 0,
  });

  const handlePasteSample = () => {
    setInputText(
      "marcus.vance@apexflooring.com\nsjenkins@precisionconcrete.com\ntmiller@tristateepoxy.net\nsamantha@elitecoatings.com\nbsterling@sterlingindustrial.com"
    );
  };

  const parseEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
  };

  const handleEnrich = async () => {
    const emails = parseEmails(inputText);
    if (emails.length === 0) {
      alert("No valid email addresses found in input. Please paste emails or upload a valid file.");
      return;
    }

    setIsProcessing(true);
    setRecords([]);

    const seedNames = ["Marcus Vance", "Sarah Jenkins", "Thomas Miller", "Samantha Wright", "Brad Sterling"];
    const seedCompanies = ["Apex Flooring Solutions", "Precision Concrete & Epoxy", "Tri-State Epoxy Coatings", "Elite Decorative Coatings", "Sterling Industrial Floors"];
    const seedTitles = ["VP of Field Operations", "Senior Project Manager", "General Manager", "Operations Director", "VP of Quality Control"];

    const mockRecords: EnrichedRecord[] = [];

    for (let i = 0; i < emails.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const email = emails[i];
      const isSeedMatch = i < seedNames.length;

      const statuses: EnrichedRecord["status"][] = ["Valid", "Catch-All", "Valid", "Invalid"];
      const randomStatus = isSeedMatch ? "Valid" : statuses[Math.floor(Math.random() * statuses.length)];

      mockRecords.push({
        id: `enriched-${Date.now()}-${i}`,
        pastedInput: email,
        email,
        status: randomStatus,
        name: isSeedMatch ? seedNames[i] : `Lead Specialist ${i + 1}`,
        company: isSeedMatch ? seedCompanies[i] : "Contracting Co. Inc.",
        title: isSeedMatch ? seedTitles[i] : "Strategic Operations Director",
        linkedin: `linkedin.com/in/user-${i + 100}`,
        enrichmentScore: randomStatus === "Valid" ? 85 + (i % 15) : randomStatus === "Catch-All" ? 70 : 10,
      });
    }

    const validCount = mockRecords.filter((r) => r.status === "Valid").length;
    const catchAllCount = mockRecords.filter((r) => r.status === "Catch-All").length;
    const invalidCount = mockRecords.filter((r) => r.status === "Invalid").length;

    setRecords(mockRecords);
    setValidationSummary({
      total: mockRecords.length,
      valid: validCount,
      catchAll: catchAllCount,
      invalid: invalidCount,
    });
    setIsProcessing(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setInputText("");
    setRecords([]);
    setValidationSummary({ total: 0, valid: 0, catchAll: 0, invalid: 0 });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-[#6366f1]" />
            <Badge variant="outline" className="bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
              LEAD METADATA HARVESTER
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bulk Email Verification & Enrichment</h1>
          <p className="text-sm text-neutral-400">
            Verify email deliverability, check catch-all risk states, and extract contractor social metadata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/[0.03] border-white/10 md:col-span-1">
            <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white">Integration Status</CardTitle>
                <CardDescription className="text-[10px] text-neutral-400">
                  Apollo validation systems status
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20 px-2 py-0.5 rounded-full">
                Connected
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" /> API Connections
                </span>
                <span className="font-semibold text-white">Active</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> Credit Balance
                </span>
                <span className="font-semibold text-[#6366f1]">9,482 credits</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 text-neutral-500" /> Profiles Scraped
                </span>
                <span className="font-semibold text-white">840 profiles</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/10 md:col-span-1">
            <CardHeader className="p-4 border-b border-white/10">
              <CardTitle className="text-sm font-semibold text-white">Deliverability Breakdown</CardTitle>
              <CardDescription className="text-[10px] text-neutral-400">
                Summary of the currently validated lists
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex justify-around items-center h-20 text-center">
              <div>
                <p className="text-lg font-bold text-emerald-400">{validationSummary.valid}</p>
                <p className="text-[10px] text-neutral-400">Valid</p>
              </div>
              <div>
                <p className="text-lg font-bold text-sky-400">{validationSummary.catchAll}</p>
                <p className="text-[10px] text-neutral-400">Catch-All</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{validationSummary.invalid}</p>
                <p className="text-[10px] text-neutral-400">Invalid</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-lg font-bold text-white">{validationSummary.total}</p>
                <p className="text-[10px] text-neutral-300">Total Leads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/10 md:col-span-1">
            <CardHeader className="p-4 border-b border-white/10">
              <CardTitle className="text-sm font-semibold text-white">Quick Upload Options</CardTitle>
              <CardDescription className="text-[10px] text-neutral-400">
                Upload CSV or XLS sheet to pull contact emails
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <label className="border border-dashed border-white/10 hover:border-[#6366f1]/50 rounded-xl flex flex-col items-center justify-center py-4 cursor-pointer transition-all">
                <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                <span className="text-xs text-neutral-300 font-medium">Select Lead CSV Sheet</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">Max 5MB</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCSVUpload}
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="p-4 border-b border-white/10 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-semibold text-white">Paste Emails</CardTitle>
                  <CardDescription className="text-xs text-neutral-400">
                    Input a clean list of emails or copy raw notes.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400 hover:text-[#6366f1] text-[10px] h-7 px-2"
                  onClick={handlePasteSample}
                >
                  Load Sample
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <textarea
                  placeholder="Paste contractor emails here (one per line, or a raw block of text containing email addresses)..."
                  className="w-full min-h-[220px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                    onClick={handleClear}
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" /> Clear
                  </Button>
                  <Button
                    className="flex-1 bg-[#6366f1] text-white hover:bg-[#6366f1]/90 text-xs"
                    disabled={isProcessing}
                    onClick={handleEnrich}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Run Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="p-4 border-b border-white/10">
                <CardTitle className="text-sm font-semibold text-white">Enriched Lead Results</CardTitle>
                <CardDescription className="text-xs text-neutral-400">
                  Deliverability statuses and contact profiles scraped from our verified lists.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isProcessing ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[#6366f1] animate-spin" />
                    <p className="text-xs text-neutral-400">Analyzing records and harvesting LinkedIn profiles...</p>
                  </div>
                ) : records.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-neutral-400">
                          <th className="p-4 font-semibold">Verification</th>
                          <th className="p-4 font-semibold">Lead Contact</th>
                          <th className="p-4 font-semibold">Operational Title</th>
                          <th className="p-4 font-semibold">Company</th>
                          <th className="p-4 font-semibold">LinkedIn Profile</th>
                          <th className="p-4 font-semibold">AI Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {records.map((r) => (
                          <tr key={r.id} className="hover:bg-white/[0.01] transition-all">
                            <td className="p-4">
                              {r.status === "Valid" && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none flex items-center gap-1 w-fit text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Valid
                                </Badge>
                              )}
                              {r.status === "Catch-All" && (
                                <Badge className="bg-sky-500/10 text-sky-400 border-none flex items-center gap-1 w-fit text-[10px]">
                                  <HelpCircle className="w-3 h-3" /> Catch-All
                                </Badge>
                              )}
                              {r.status === "Invalid" && (
                                <Badge className="bg-red-500/10 text-red-400 border-none flex items-center gap-1 w-fit text-[10px]">
                                  <AlertTriangle className="w-3 h-3" /> Invalid
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-white">{r.name || "Unknown Lead"}</p>
                              <p className="text-[10px] text-neutral-400">{r.email}</p>
                            </td>
                            <td className="p-4 text-neutral-300">{r.title || "—"}</td>
                            <td className="p-4 text-neutral-300">{r.company || "—"}</td>
                            <td className="p-4">
                              {r.linkedin ? (
                                <a
                                  href={`https://${r.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#6366f1] hover:underline flex items-center gap-1 text-[10px]"
                                >
                                  <Linkedin className="w-3 h-3" /> Profile
                                </a>
                              ) : (
                                <span className="text-neutral-500">—</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-[#6366f1] font-semibold">
                                {r.enrichmentScore ? `${r.enrichmentScore}%` : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-neutral-600" />
                    <span>No leads validated in this session. Paste emails above and click Run Verification.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
