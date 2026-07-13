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
  Mail,
  Clock,
  Linkedin,
  Phone,
  Plus,
  Play,
  Pause,
  Trash2,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Save,
} from "lucide-react";

export interface SequenceStep {
  id: string;
  type: "Email" | "Wait" | "LinkedIn" | "Call";
  delayDays: number;
  subject?: string;
  body?: string;
  actionText?: string;
}

export interface Sequence {
  id: string;
  name: string;
  enrolled: number;
  openRate: number;
  replyRate: number;
  status: "active" | "paused";
  steps: SequenceStep[];
}

const SEED_SEQUENCES: Sequence[] = [
  {
    id: "seq-1",
    name: "PCU Alumni Outreach",
    enrolled: 142,
    openRate: 68.4,
    replyRate: 24.1,
    status: "active",
    steps: [
      {
        id: "step-1-1",
        type: "Email",
        delayDays: 0,
        subject: "XAB Partnership opportunity & PCU connection",
        body: "Hi {{first_name}},\n\nI noticed you graduated from PCU and are doing amazing work over at {{company}}.\n\nWe recently rolled out an advanced epoxy visualizer for high-volume flooring contractors. I'd love to show you how our local partners are using it to close 40% more commercial flooring deals.\n\nDo you have 10 minutes next Tuesday at 2 PM?",
      },
      {
        id: "step-1-2",
        type: "Wait",
        delayDays: 3,
      },
      {
        id: "step-1-3",
        type: "LinkedIn",
        delayDays: 0,
        actionText: "Send Connection Request with brief note referencing PCU alumni network & epoxy tech.",
      },
      {
        id: "step-1-4",
        type: "Wait",
        delayDays: 4,
      },
      {
        id: "step-1-5",
        type: "Email",
        delayDays: 0,
        subject: "Re: PCU Connection / Epoxy visualizer demo",
        body: "Hey {{first_name}},\n\nJust bumping this in case it got buried under field operations.\n\nI wanted to share a quick 1-minute video link of the interactive flooring designer in action: xab.design/preview-demo\n\nLet me know if you are open to a quick chat this week!",
      },
    ],
  },
  {
    id: "seq-2",
    name: "Cold Epoxy Contractor Campaign",
    enrolled: 310,
    openRate: 52.1,
    replyRate: 14.8,
    status: "active",
    steps: [
      {
        id: "step-2-1",
        type: "Email",
        delayDays: 0,
        subject: "Streamlining operations for {{company}}",
        body: "Hi {{first_name}},\n\nManaging epoxy floor schedules is highly chaotic—from slab testing to polyaspartic curing times.\n\nAt XAB, we help contractors in {{location}} automate their lead pipelines and material tracking so field supervisors can focus entirely on perfect finishes.\n\nCan I send over our 1-page integration breakdown?",
      },
      {
        id: "step-2-2",
        type: "Wait",
        delayDays: 4,
      },
      {
        id: "step-2-3",
        type: "Call",
        delayDays: 0,
        actionText: "Direct Operational Call. Pitch XAB Lead System and offer immediate site setup.",
      },
    ],
  },
  {
    id: "seq-3",
    name: "Warm Re-engagement Sequence",
    enrolled: 89,
    openRate: 74.3,
    replyRate: 38.5,
    status: "paused",
    steps: [
      {
        id: "step-3-1",
        type: "LinkedIn",
        delayDays: 0,
        actionText: "Send personalized direct message: 'Hey {{first_name}}, hope the current commercial bids are going smoothly. Just wanted to check in...'",
      },
      {
        id: "step-3-2",
        type: "Wait",
        delayDays: 5,
      },
      {
        id: "step-3-3",
        type: "Email",
        delayDays: 0,
        subject: "New local pricing options for {{company}}",
        body: "Hi {{first_name}},\n\nIt's been a few weeks since we discussed premium contractor pricing models.\n\nWe updated our commercial flooring tier. You can now onboard up to 5 regional estimators with unlimited client visualizer bid presentations.\n\nLet me know if you'd like me to reactivate your draft workspace.",
      },
    ],
  },
];

export default function SequencesClient() {
  const [sequences, setSequences] = useState<Sequence[]>(SEED_SEQUENCES);
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>("seq-1");

  const [newSeqName, setNewSeqName] = useState("");

  const activeSequence = sequences.find((s) => s.id === selectedSequenceId) || sequences[0];

  const handleAddSequence = () => {
    if (!newSeqName.trim()) return;
    const newSeq: Sequence = {
      id: `seq-${Date.now()}`,
      name: newSeqName,
      enrolled: 0,
      openRate: 0.0,
      replyRate: 0.0,
      status: "paused",
      steps: [
        {
          id: `step-${Date.now()}-1`,
          type: "Email",
          delayDays: 0,
          subject: "Welcome to XAB Partnership",
          body: "Hello {{first_name}},\n\nWe are looking forward to showing you our floor design systems...",
        },
      ],
    };
    setSequences((prev) => [...prev, newSeq]);
    setSelectedSequenceId(newSeq.id);
    setNewSeqName("");
  };

  const handleToggleStatus = (id: string) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s))
    );
  };

  const handleDeleteSequence = (id: string) => {
    const remaining = sequences.filter((s) => s.id !== id);
    setSequences(remaining);
    if (selectedSequenceId === id && remaining.length > 0) {
      setSelectedSequenceId(remaining[0].id);
    }
  };

  const handleAddStep = (type: "Email" | "Wait" | "LinkedIn" | "Call") => {
    if (!activeSequence) return;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      delayDays: type === "Wait" ? 3 : 0,
      ...(type === "Email" ? { subject: "Follow-up regarding XAB platform", body: "Hi {{first_name}},\n\nFollowing up..." } : {}),
      ...(type === "LinkedIn" || type === "Call" ? { actionText: "Perform strategic connection outreach activity" } : {}),
    };

    setSequences((prev) =>
      prev.map((s) =>
        s.id === activeSequence.id ? { ...s, steps: [...s.steps, newStep] } : s
      )
    );
  };

  const handleUpdateStepDelay = (stepId: string, days: number) => {
    setSequences((prev) =>
      prev.map((s) => {
        if (s.id !== activeSequence.id) return s;
        return {
          ...s,
          steps: s.steps.map((st) => (st.id === stepId ? { ...st, delayDays: days } : st)),
        };
      })
    );
  };

  const handleUpdateStepText = (stepId: string, field: "subject" | "body" | "actionText", value: string) => {
    setSequences((prev) =>
      prev.map((s) => {
        if (s.id !== activeSequence.id) return s;
        return {
          ...s,
          steps: s.steps.map((st) => (st.id === stepId ? { ...st, [field]: value } : st)),
        };
      })
    );
  };

  const handleRemoveStep = (stepId: string) => {
    setSequences((prev) =>
      prev.map((s) => {
        if (s.id !== activeSequence.id) return s;
        return {
          ...s,
          steps: s.steps.filter((st) => st.id !== stepId),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-[#6366f1]" />
            <Badge variant="outline" className="bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
              OUTBOUND CAMPAIGNS
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Outreach Sequence Builder</h1>
          <p className="text-sm text-neutral-400">
            Build and monitor automated multi-channel sequences targeting top contracting partners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white/[0.03] border-white/10">
              <CardHeader className="p-4 border-b border-white/10">
                <CardTitle className="text-sm font-semibold text-white">Outreach Campaigns</CardTitle>
                <CardDescription className="text-xs text-neutral-400">
                  Select a sequence to edit, inspect or toggle outbound states.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="New campaign name..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 text-xs h-9"
                    value={newSeqName}
                    onChange={(e) => setNewSeqName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-[#6366f1] text-white hover:bg-[#6366f1]/90 px-3 h-9 text-xs"
                    onClick={handleAddSequence}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {sequences.map((seq) => (
                  <div
                    key={seq.id}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedSequenceId === seq.id
                        ? "bg-[#6366f1]/10 border-[#6366f1]"
                        : "bg-white/[0.01] border-white/5 hover:border-white/10"
                    }`}
                    onClick={() => setSelectedSequenceId(seq.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{seq.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
                          <Users className="w-3 h-3 text-neutral-500" />
                          <span>{seq.enrolled} enrolled</span>
                          <span>•</span>
                          <span className="text-emerald-400">{seq.openRate}% opens</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          seq.status === "active"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-neutral-400 bg-white/5 border-white/10"
                        }`}
                      >
                        {seq.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/[0.03]">
                      <div className="flex gap-1.5">
                        {seq.steps.map((st, i) => (
                          <span key={st.id} className="flex items-center text-xs text-neutral-500">
                            {st.type === "Email" && <Mail className="w-3 h-3 text-[#6366f1]" />}
                            {st.type === "Wait" && <Clock className="w-3 h-3 text-neutral-400" />}
                            {st.type === "LinkedIn" && <Linkedin className="w-3 h-3 text-sky-400" />}
                            {st.type === "Call" && <Phone className="w-3 h-3 text-emerald-400" />}
                            {i < seq.steps.length - 1 && <ChevronRight className="w-2.5 h-2.5 ml-1 text-neutral-700" />}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-neutral-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(seq.id);
                          }}
                        >
                          {seq.status === "active" ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-[#6366f1]" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-neutral-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSequence(seq.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {activeSequence ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-xl border border-white/5">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeSequence.name}</h2>
                    <p className="text-xs text-neutral-400">
                      Edit marketing steps, emails body text and wait rules.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1]/20 border-none">
                      {activeSequence.steps.length} steps configured
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeSequence.steps.map((step, index) => (
                    <div key={step.id} className="relative pl-6">
                      {index < activeSequence.steps.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-white/5" />
                      )}

                      <div className="absolute left-1 top-2.5 w-4 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                        {index + 1}
                      </div>

                      <Card className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all">
                        <div className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              {step.type === "Email" && (
                                <>
                                  <Badge className="bg-[#6366f1]/10 text-[#6366f1] border-none text-xs flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Automated Email
                                  </Badge>
                                </>
                              )}
                              {step.type === "Wait" && (
                                <>
                                  <Badge className="bg-white/5 text-neutral-300 border-none text-xs flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Time Delay Rule
                                  </Badge>
                                </>
                              )}
                              {step.type === "LinkedIn" && (
                                <>
                                  <Badge className="bg-sky-500/10 text-sky-400 border-none text-xs flex items-center gap-1.5">
                                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Connection task
                                  </Badge>
                                </>
                              )}
                              {step.type === "Call" && (
                                <>
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-xs flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> Call outreach task
                                  </Badge>
                                </>
                              )}
                            </div>

                            {step.type === "Email" && (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Subject line"
                                  className="bg-white/5 border-white/10 text-white font-medium text-xs"
                                  value={step.subject || ""}
                                  onChange={(e) =>
                                    handleUpdateStepText(step.id, "subject", e.target.value)
                                  }
                                />
                                <textarea
                                  placeholder="Type your strategic outbound email message..."
                                  className="w-full min-h-[120px] rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
                                  value={step.body || ""}
                                  onChange={(e) => handleUpdateStepText(step.id, "body", e.target.value)}
                                />
                              </div>
                            )}

                            {step.type === "Wait" && (
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-300">Wait duration:</span>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="30"
                                    className="bg-white/5 border-white/10 text-white w-16 text-center text-xs h-8"
                                    value={step.delayDays}
                                    onChange={(e) =>
                                      handleUpdateStepDelay(step.id, parseInt(e.target.value) || 1)
                                    }
                                  />
                                  <span className="text-xs text-neutral-400">Days</span>
                                </div>
                              </div>
                            )}

                            {(step.type === "LinkedIn" || step.type === "Call") && (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Strategic outreach action description..."
                                  className="bg-white/5 border-white/10 text-white text-xs"
                                  value={step.actionText || ""}
                                  onChange={(e) =>
                                    handleUpdateStepText(step.id, "actionText", e.target.value)
                                  }
                                />
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-neutral-400 hover:text-red-400 self-end md:self-start gap-1 text-xs"
                            onClick={() => handleRemoveStep(step.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Step
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/[0.05] space-y-2.5">
                  <h4 className="text-xs font-semibold text-neutral-400">Add Next Campaign Step</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                      onClick={() => handleAddStep("Email")}
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-[#6366f1]" /> Email Step
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                      onClick={() => handleAddStep("Wait")}
                    >
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-neutral-400" /> Wait Step
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                      onClick={() => handleAddStep("LinkedIn")}
                    >
                      <Linkedin className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> LinkedIn Step
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                      onClick={() => handleAddStep("Call")}
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Call Step
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                <span className="text-sm text-neutral-400">No campaigns available. Create one to begin.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
