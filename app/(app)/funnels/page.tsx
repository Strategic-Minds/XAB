"use client";

import * as React from "react";
import {
  Plus, GitBranch, TrendingUp, Users, DollarSign, Eye,
  MoreHorizontal, Edit2, Trash2, Copy, ExternalLink,
  Play, Pause, Settings, Search, Filter, ChevronRight,
  ArrowRight, Target, Zap, Globe, Mail, Video,
  ShoppingCart, Calendar, ClipboardList, CheckCircle2,
  XCircle, Clock, BarChart2, Sparkles, X, GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────

type FunnelType =
  | "lead_capture" | "sales" | "webinar" | "product_launch"
  | "appointment" | "survey" | "quiz" | "vsl" | "tripwire" | "waitlist";

type FunnelStatus = "draft" | "active" | "paused" | "archived";

type StepType =
  | "landing" | "optin" | "sales" | "upsell" | "downsell"
  | "order" | "thankyou" | "video" | "webinar" | "calendar" | "survey" | "checkout";

interface FunnelStep {
  id: string;
  name: string;
  type: StepType;
  position: number;
}

interface Funnel {
  id: string;
  name: string;
  description?: string;
  type: FunnelType;
  status: FunnelStatus;
  slug?: string;
  total_visits: number;
  total_conversions: number;
  conversion_rate: number;
  revenue: number;
  published_at?: string;
  created_at: string;
  steps?: FunnelStep[];
}

// ─── Constants ────────────────────────────────────────────

const FUNNEL_TYPES: { value: FunnelType; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "lead_capture", label: "Lead Capture", desc: "Collect leads with a magnet", icon: Users, color: "text-blue-400" },
  { value: "sales", label: "Sales Funnel", desc: "Convert visitors to buyers", icon: DollarSign, color: "text-green-400" },
  { value: "webinar", label: "Webinar", desc: "Registration & replay funnel", icon: Video, color: "text-purple-400" },
  { value: "product_launch", label: "Product Launch", desc: "Build hype and launch", icon: Zap, color: "text-yellow-400" },
  { value: "appointment", label: "Appointment", desc: "Book calls & meetings", icon: Calendar, color: "text-indigo-400" },
  { value: "survey", label: "Survey", desc: "Qualify leads with questions", icon: ClipboardList, color: "text-orange-400" },
  { value: "quiz", label: "Quiz Funnel", desc: "Interactive lead quiz", icon: Target, color: "text-pink-400" },
  { value: "vsl", label: "VSL Funnel", desc: "Video sales letter funnel", icon: Play, color: "text-red-400" },
  { value: "tripwire", label: "Tripwire", desc: "Low-cost intro offer", icon: ShoppingCart, color: "text-cyan-400" },
  { value: "waitlist", label: "Waitlist", desc: "Pre-launch email list", icon: Mail, color: "text-amber-400" },
];

const STEP_TYPES: { value: StepType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "landing", label: "Landing Page", icon: Globe, color: "text-blue-400" },
  { value: "optin", label: "Opt-in", icon: Mail, color: "text-indigo-400" },
  { value: "sales", label: "Sales Page", icon: DollarSign, color: "text-green-400" },
  { value: "upsell", label: "Upsell", icon: TrendingUp, color: "text-emerald-400" },
  { value: "downsell", label: "Downsell", icon: ChevronRight, color: "text-yellow-400" },
  { value: "order", label: "Order Form", icon: ShoppingCart, color: "text-orange-400" },
  { value: "checkout", label: "Checkout", icon: ShoppingCart, color: "text-red-400" },
  { value: "thankyou", label: "Thank You", icon: CheckCircle2, color: "text-teal-400" },
  { value: "video", label: "Video Page", icon: Video, color: "text-purple-400" },
  { value: "webinar", label: "Webinar", icon: Video, color: "text-violet-400" },
  { value: "calendar", label: "Calendar", icon: Calendar, color: "text-pink-400" },
  { value: "survey", label: "Survey", icon: ClipboardList, color: "text-amber-400" },
];

const STATUS_CONFIG: Record<FunnelStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-green-400", bg: "bg-green-500/10" },
  draft: { label: "Draft", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  paused: { label: "Paused", color: "text-amber-400", bg: "bg-amber-500/10" },
  archived: { label: "Archived", color: "text-red-400", bg: "bg-red-500/10" },
};

// ─── Demo data for immediate display (replaced by real DB data) ───

const DEMO_FUNNELS: Funnel[] = [];

// ─── Sub-components ───────────────────────────────────────

function StepDot({ type, size = "sm" }: { type: StepType; size?: "sm" | "md" }) {
  const cfg = STEP_TYPES.find(s => s.value === type) ?? STEP_TYPES[0];
  const Icon = cfg.icon;
  const sz = size === "md" ? "w-8 h-8" : "w-6 h-6";
  const icon = size === "md" ? "w-3.5 h-3.5" : "w-3 h-3";
  return (
    <div className={cn("rounded-lg bg-[var(--color-surface-4)] border border-[var(--color-border)] flex items-center justify-center shrink-0", sz)}>
      <Icon className={cn(icon, cfg.color)} />
    </div>
  );
}

function FunnelFlowPreview({ steps }: { steps: FunnelStep[] }) {
  const sorted = [...steps].sort((a, b) => a.position - b.position);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {sorted.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-1">
            <StepDot type={step.type} />
            <span className="text-[9px] text-[var(--color-muted-foreground)] hidden sm:block">{step.name}</span>
          </div>
          {i < sorted.length - 1 && (
            <ArrowRight className="w-2.5 h-2.5 text-[var(--color-muted-foreground)]/40 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Create Funnel Modal ──────────────────────────────────

function CreateFunnelModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (funnel: Funnel) => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<FunnelType>("lead_capture");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setLoading(false); return; }

    const { data, error: dbError } = await supabase
      .from("funnels")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        type,
        status: "draft",
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    // Create default steps based on funnel type
    const defaultSteps: Omit<FunnelStep, "id">[] =
      type === "lead_capture" ? [
        { name: "Landing Page", type: "landing", position: 0 },
        { name: "Opt-in Form", type: "optin", position: 1 },
        { name: "Thank You", type: "thankyou", position: 2 },
      ] :
      type === "sales" ? [
        { name: "Sales Page", type: "sales", position: 0 },
        { name: "Order Form", type: "order", position: 1 },
        { name: "Upsell", type: "upsell", position: 2 },
        { name: "Thank You", type: "thankyou", position: 3 },
      ] :
      type === "webinar" ? [
        { name: "Registration", type: "landing", position: 0 },
        { name: "Opt-in", type: "optin", position: 1 },
        { name: "Webinar Room", type: "webinar", position: 2 },
      ] : [
        { name: "Landing Page", type: "landing", position: 0 },
        { name: "Opt-in", type: "optin", position: 1 },
        { name: "Thank You", type: "thankyou", position: 2 },
      ];

    await supabase.from("funnel_steps").insert(
      defaultSteps.map(s => ({ ...s, funnel_id: data.id, user_id: user.id }))
    );

    const stepsResult = await supabase
      .from("funnel_steps")
      .select("*")
      .eq("funnel_id", data.id)
      .order("position");

    onCreate({ ...data, steps: stepsResult.data ?? [] });
    setName("");
    setDescription("");
    setType("lead_capture");
    setLoading(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">Create New Funnel</h2>
              <p className="text-[11px] text-[var(--color-muted-foreground)]">Default steps are auto-generated</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--color-muted-foreground)]">Funnel name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. SaaS Lead Magnet 2024"
                required
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--color-muted-foreground)]">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly describe this funnel's goal..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] resize-none transition-all"
              />
            </div>

            {/* Type grid */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[var(--color-muted-foreground)]">Funnel type *</label>
              <div className="grid grid-cols-2 gap-2">
                {FUNNEL_TYPES.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => setType(ft.value)}
                      className={cn(
                        "flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        type === ft.value
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-3)]"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", type === ft.value ? "text-indigo-400" : ft.color)} />
                      <div>
                        <div className="text-[11px] font-semibold text-[var(--color-foreground)]">{ft.label}</div>
                        <div className="text-[9px] text-[var(--color-muted-foreground)]">{ft.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 pb-5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[12px] font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all cursor-pointer"
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
              ) : (
                <><Plus className="w-3.5 h-3.5" />Create Funnel</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Step Editor Panel ────────────────────────────────────

function StepEditorPanel({
  funnel,
  onClose,
  onSave,
}: {
  funnel: Funnel;
  onClose: () => void;
  onSave: (updatedFunnel: Funnel) => void;
}) {
  const [steps, setSteps] = React.useState<FunnelStep[]>(
    (funnel.steps ?? []).sort((a, b) => a.position - b.position)
  );
  const [saving, setSaving] = React.useState(false);
  const [addingStep, setAddingStep] = React.useState(false);
  const [newStepType, setNewStepType] = React.useState<StepType>("landing");
  const [newStepName, setNewStepName] = React.useState("");

  async function addStep() {
    if (!newStepName.trim()) return;
    setSaving(true);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const position = steps.length;
    const { data, error } = await supabase
      .from("funnel_steps")
      .insert({ funnel_id: funnel.id, user_id: user.id, name: newStepName, type: newStepType, position })
      .select()
      .single();

    if (!error && data) {
      setSteps(prev => [...prev, data]);
      setNewStepName("");
      setAddingStep(false);
    }
    setSaving(false);
  }

  async function deleteStep(stepId: string) {
    const supabase = await createClient();
    await supabase.from("funnel_steps").delete().eq("id", stepId);
    setSteps(prev => prev.filter(s => s.id !== stepId));
  }

  function handleClose() {
    onSave({ ...funnel, steps });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 ml-auto w-full max-w-md h-full bg-[var(--color-surface-1)] border-l border-[var(--color-border)] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-[14px] font-semibold text-[var(--color-foreground)]">{funnel.name}</h2>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">Visual step editor</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Funnel stats */}
        <div className="px-5 py-3 border-b border-[var(--color-border)] shrink-0">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Visits", value: funnel.total_visits.toLocaleString(), color: "text-[var(--color-foreground)]" },
              { label: "Conversions", value: funnel.total_conversions.toLocaleString(), color: "text-indigo-400" },
              { label: "Conv. Rate", value: `${funnel.conversion_rate.toFixed(1)}%`, color: "text-green-400" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn("text-[15px] font-bold", s.color)}>{s.value}</div>
                <div className="text-[9px] text-[var(--color-muted-foreground)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="text-[11px] font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3">
            Funnel Steps ({steps.length})
          </div>

          {steps.map((step, i) => {
            const cfg = STEP_TYPES.find(s => s.value === step.type) ?? STEP_TYPES[0];
            const Icon = cfg.icon;
            return (
              <div key={step.id} className="group flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors">
                {/* Position */}
                <div className="flex items-center gap-2 shrink-0">
                  <GripVertical className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div className="w-5 h-5 rounded-full bg-[var(--color-surface-4)] border border-[var(--color-border)] flex items-center justify-center text-[9px] font-bold text-[var(--color-muted-foreground)]">
                    {i + 1}
                  </div>
                </div>

                {/* Icon */}
                <div className={cn("w-7 h-7 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center shrink-0")}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--color-foreground)] truncate">{step.name}</div>
                  <div className="text-[10px] text-[var(--color-muted-foreground)] capitalize">{cfg.label}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteStep(step.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-[var(--color-muted-foreground)] hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Arrow connectors visual */}
          {steps.length === 0 && (
            <div className="text-center py-8">
              <GitBranch className="w-8 h-8 text-[var(--color-muted-foreground)]/30 mx-auto mb-2" />
              <div className="text-[12px] text-[var(--color-muted-foreground)]">No steps yet</div>
            </div>
          )}
        </div>

        {/* Add step form */}
        <div className="p-5 border-t border-[var(--color-border)] shrink-0 bg-[var(--color-surface-0)]">
          {addingStep ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                {STEP_TYPES.map(st => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => { setNewStepType(st.value); setNewStepName(st.label); }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer text-[11px]",
                        newStepType === st.value
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
                      )}
                    >
                      <Icon className={cn("w-3 h-3 shrink-0", newStepType === st.value ? "text-indigo-400" : st.color)} />
                      {st.label}
                    </button>
                  );
                })}
              </div>
              <input
                value={newStepName}
                onChange={e => setNewStepName(e.target.value)}
                placeholder="Step name..."
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[12px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)]"
              />
              <div className="flex gap-2">
                <button onClick={() => setAddingStep(false)} className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={addStep}
                  disabled={saving || !newStepName.trim()}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-[12px] font-semibold transition-all cursor-pointer"
                >
                  {saving ? "Adding..." : "Add Step"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingStep(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-[12px] text-[var(--color-muted-foreground)] hover:border-indigo-500/50 hover:text-indigo-400 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function FunnelsPage() {
  const [funnels, setFunnels] = React.useState<Funnel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<FunnelStatus | "all">("all");
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingFunnel, setEditingFunnel] = React.useState<Funnel | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadFunnels() {
      setLoading(true);
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFunnels(DEMO_FUNNELS);
        setLoading(false);
        return;
      }

      const { data: funnelData } = await supabase
        .from("funnels")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (funnelData && funnelData.length > 0) {
        // Load steps for each funnel
        const { data: stepsData } = await supabase
          .from("funnel_steps")
          .select("*")
          .in("funnel_id", funnelData.map(f => f.id))
          .order("position");

        const stepsMap = (stepsData ?? []).reduce((acc, s) => {
          if (!acc[s.funnel_id]) acc[s.funnel_id] = [];
          acc[s.funnel_id].push(s);
          return acc;
        }, {} as Record<string, FunnelStep[]>);

        setFunnels(funnelData.map(f => ({ ...f, steps: stepsMap[f.id] ?? [] })));
      } else {
        // Show demo data for empty state
        setFunnels(DEMO_FUNNELS);
      }
      setLoading(false);
    }
    loadFunnels();
  }, []);

  const filtered = funnels.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = funnels.reduce((a, b) => a + (b.revenue ?? 0), 0);
  const activeFunnels = funnels.filter(f => f.status === "active").length;
  const totalVisits = funnels.reduce((a, b) => a + (b.total_visits ?? 0), 0);
  const avgConversion = funnels.length > 0
    ? funnels.reduce((a, b) => a + (b.conversion_rate ?? 0), 0) / funnels.length
    : 0;

  async function deleteFunnel(id: string) {
    if (id.startsWith("demo-")) {
      setFunnels(prev => prev.filter(f => f.id !== id));
      return;
    }
    const supabase = await createClient();
    await supabase.from("funnels").delete().eq("id", id);
    setFunnels(prev => prev.filter(f => f.id !== id));
  }

  async function toggleStatus(funnel: Funnel) {
    const newStatus: FunnelStatus = funnel.status === "active" ? "paused" : "active";
    if (!funnel.id.startsWith("demo-")) {
      const supabase = await createClient();
      await supabase.from("funnels").update({ status: newStatus }).eq("id", funnel.id);
    }
    setFunnels(prev => prev.map(f => f.id === funnel.id ? { ...f, status: newStatus } : f));
  }

  return (
    <>
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[var(--color-foreground)] tracking-tight flex items-center gap-2.5">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              Funnel Builder
            </h1>
            <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">
              Build multi-step conversion funnels with AI-powered optimization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400">
              <Sparkles className="w-3 h-3" />
              AI A/B testing available
            </div>
            <Button className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="w-3.5 h-3.5" />
              New Funnel
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Active Funnels", value: activeFunnels, icon: GitBranch, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Total Visits", value: totalVisits.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Conversion", value: `${avgConversion.toFixed(1)}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="relative overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border)]", kpi.bg)}>
                    <Icon className={cn("w-4 h-4", kpi.color)} />
                  </div>
                  <div>
                    <div className="text-[18px] font-bold text-[var(--color-foreground)] leading-tight">{kpi.value}</div>
                    <div className="text-[11px] text-[var(--color-muted-foreground)]">{kpi.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search funnels..."
              className="pl-9 h-8 text-[12px]"
            />
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            {(["all", "active", "draft", "paused", "archived"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer",
                  filterStatus === s
                    ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Funnel grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl shimmer-bg border border-[var(--color-border)]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GitBranch className="w-10 h-10 text-[var(--color-muted-foreground)]/30 mb-3" />
            <div className="text-[14px] font-semibold text-[var(--color-foreground)] mb-1">No funnels found</div>
            <div className="text-[12px] text-[var(--color-muted-foreground)] mb-4">
              {search ? "Try a different search term" : "Create your first funnel to get started"}
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />New Funnel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(funnel => {
              const typeConfig = FUNNEL_TYPES.find(t => t.value === funnel.type);
              const statusCfg = STATUS_CONFIG[funnel.status];
              const TypeIcon = typeConfig?.icon ?? Target;

              return (
                <Card
                  key={funnel.id}
                  className="group relative overflow-hidden cursor-pointer hover:border-[var(--color-primary)]/30 transition-all duration-200"
                  onClick={() => setEditingFunnel(funnel)}
                >
                  <CardContent className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center">
                          <TypeIcon className={cn("w-4 h-4", typeConfig?.color ?? "text-indigo-400")} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[var(--color-foreground)] leading-tight truncate max-w-[160px]">{funnel.name}</div>
                          <div className="text-[10px] text-[var(--color-muted-foreground)] capitalize">{typeConfig?.label}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusCfg.color, statusCfg.bg)}>
                          {statusCfg.label}
                        </span>
                        <div className="relative">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === funnel.id ? null : funnel.id); }}
                            className="p-1 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                          {openMenuId === funnel.id && (
                            <div className="absolute right-0 top-7 z-30 w-40 bg-[var(--color-popover)] border border-[var(--color-border)] rounded-lg shadow-xl py-1" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => { setEditingFunnel(funnel); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />Edit Steps
                              </button>
                              <button
                                onClick={() => { toggleStatus(funnel); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)] cursor-pointer"
                              >
                                {funnel.status === "active" ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Activate</>}
                              </button>
                              <button
                                onClick={() => { deleteFunnel(funnel.id); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {funnel.description && (
                      <p className="text-[11px] text-[var(--color-muted-foreground)] mb-3 line-clamp-1">{funnel.description}</p>
                    )}

                    {/* Flow preview */}
                    {funnel.steps && funnel.steps.length > 0 && (
                      <div className="mb-3 p-2.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                        <FunnelFlowPreview steps={funnel.steps} />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)]">
                      <div className="text-center">
                        <div className="text-[13px] font-bold text-[var(--color-foreground)] tabular-nums">
                          {funnel.total_visits.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-[var(--color-muted-foreground)]">Visits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-bold text-indigo-400 tabular-nums">
                          {funnel.conversion_rate.toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-[var(--color-muted-foreground)]">Conv. Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-bold text-green-400">
                          {funnel.revenue > 0 ? formatCurrency(funnel.revenue) : "—"}
                        </div>
                        <div className="text-[9px] text-[var(--color-muted-foreground)]">Revenue</div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Bottom hover bar */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              );
            })}

            {/* Create card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-[var(--color-border)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 flex items-center justify-center transition-all">
                <Plus className="w-5 h-5 text-[var(--color-muted-foreground)] group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-semibold text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">Create Funnel</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)]/70 mt-0.5">10 funnel types available</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFunnelModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={newFunnel => setFunnels(prev => [newFunnel, ...prev.filter(f => !f.id.startsWith("demo-") || prev.some(df => df.id === f.id))])}
      />

      {editingFunnel && (
        <StepEditorPanel
          funnel={editingFunnel}
          onClose={() => setEditingFunnel(null)}
          onSave={updated => setFunnels(prev => prev.map(f => f.id === updated.id ? updated : f))}
        />
      )}

      {/* Close dropdown on outside click */}
      {openMenuId && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
      )}
    </>
  );
}
