"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  Send, Sparkles, Code2, Eye, Copy, Check,
  Monitor, Smartphone, Tablet, ChevronDown,
  RotateCcw, Loader2, X, Hammer, LayoutTemplate,
  Search, ExternalLink, GitBranch, Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VERCEL_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type VercelTemplate,
  type TemplateCategory,
} from "@/lib/vercel-templates";

// ─── helpers ─────────────────────────────────────────────────────────────────

function extractCode(text: string): string | null {
  const match = text.match(/```(?:tsx?|jsx?|html?)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

function buildSandboxHtml(code: string): string {
  // Check if code defines an App component, if not rename the last function to App
  let finalCode = code;
  if (!code.includes("export default function App") && !code.includes("const App =")) {
    // Replace "export default function" with "function App" to ensure we can render it
    finalCode = code.replace(/export\s+default\s+function\s+\w+/, "function App");
    // If no export default, find last function and wrap it
    if (!finalCode.includes("function App")) {
      finalCode = code.replace(/export\s+default/, "");
      finalCode = `function App() { return (<>${finalCode}</>) }\n${finalCode}`;
    }
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    * { box-sizing: border-box; }
    html, body, #root { height: 100%; width: 100%; }
  </style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    ${finalCode}
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch (e) {
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: #f4f4f5;"><strong>Error rendering component:</strong><br/>' + e.message + '</div>';
      console.error(e);
    }
  <\/script>
</body>
</html>`;
}

const VIEWPORTS = [
  { id: "desktop",  icon: Monitor,    label: "Desktop",  width: "100%" },
  { id: "tablet",   icon: Tablet,     label: "Tablet",   width: "768px" },
  { id: "mobile",   icon: Smartphone, label: "Mobile",   width: "390px" },
] as const;

const MODELS = [
  { key: "openai/gpt-4.1",              label: "GPT-4.1" },
  { key: "openai/gpt-5",                label: "GPT-5" },
  { key: "anthropic/claude-sonnet-5",   label: "Claude Sonnet 5" },
  { key: "anthropic/claude-opus-4",     label: "Claude Opus 4" },
  { key: "google/gemini-2.5-pro",       label: "Gemini 2.5 Pro" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Starter:        "bg-slate-500/15 text-slate-300 border-slate-500/20",
  AI:             "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  SaaS:           "bg-violet-500/15 text-violet-300 border-violet-500/20",
  Ecommerce:      "bg-green-500/15 text-green-300 border-green-500/20",
  Blog:           "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Portfolio:      "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Marketing:      "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Authentication: "bg-red-500/15 text-red-300 border-red-500/20",
  Realtime:       "bg-teal-500/15 text-teal-300 border-teal-500/20",
  Documentation:  "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Monorepo:       "bg-orange-500/15 text-orange-300 border-orange-500/20",
  "Multi-Tenant": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20",
};

// ─── sub-components ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onSelect,
}: {
  template: VercelTemplate;
  onSelect: (t: VercelTemplate) => void;
}) {
  const catColor = CATEGORY_COLORS[template.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/20";
  return (
    <button
      onClick={() => onSelect(template)}
      className="group w-full text-left rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-indigo-500/40 hover:bg-[var(--color-surface-3)] transition-all overflow-hidden"
    >
      {/* Preview thumbnail */}
      <div className="relative h-28 bg-[var(--color-surface-3)] overflow-hidden border-b border-[var(--color-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.previewImage}
          alt={template.name}
          className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-2)] to-transparent" />
        <span className={cn("absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border", catColor)}>
          {template.category}
        </span>
      </div>
      {/* Info */}
      <div className="p-3">
        <div className="text-[13px] font-semibold text-[var(--color-foreground)] mb-1 leading-snug">{template.name}</div>
        <p className="text-[11px] text-[var(--color-muted-foreground)] leading-relaxed line-clamp-2 mb-2">{template.description}</p>
        {/* Stack pills */}
        <div className="flex flex-wrap gap-1">
          {template.stack.slice(0, 3).map(s => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-4)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              {s}
            </span>
          ))}
          {template.stack.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-4)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
              +{template.stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function TemplateGallery({ onSelect }: { onSelect: (t: VercelTemplate) => void }) {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const filtered = React.useMemo(() => {
    let list = VERCEL_TEMPLATES;
    if (category !== "All") list = list.filter(t => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.stack.some(s => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, category]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border)] shrink-0 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[var(--color-foreground)] leading-none">Vercel Templates</div>
            <div className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5 leading-none">{VERCEL_TEMPLATES.length} official Next.js templates</div>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates, stack, tags..."
            className="pl-8 h-8 text-[12px] bg-[var(--color-surface-2)] border-[var(--color-border)]"
          />
        </div>
        {/* Category filter */}
        <div className="overflow-x-auto w-full">
          <div className="flex gap-1.5 pb-0.5">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                  category === cat
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] border-[var(--color-border)] hover:border-indigo-500/40 hover:text-[var(--color-foreground)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 px-3 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Search className="w-7 h-7 text-[var(--color-muted-foreground)]/20" />
            <p className="text-[12px] text-[var(--color-muted-foreground)]">No templates match &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map(t => (
              <TemplateCard key={t.id} template={t} onSelect={onSelect} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

type PanelView = "gallery" | "chat";

function BuilderInner() {
  const [input, setInput] = React.useState<string>("");
  const [model, setModel] = React.useState<string>(MODELS[0].key);
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const searchParams = useSearchParams();
  const [previewCode, setPreviewCode] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">("preview");
  const [copied, setCopied] = React.useState(false);
  const [modelOpen, setModelOpen] = React.useState(false);
  const [panelView, setPanelView] = React.useState<PanelView>("gallery");
  const [activeTemplate, setActiveTemplate] = React.useState<VercelTemplate | null>(null);
  const [promptFromUrl, setPromptFromUrl] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    api: "/api/builder",
    body: { model, templateId: activeTemplate?.id },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Extract latest rendered code from assistant
  React.useEffect(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      const text = lastAssistant.parts
        ?.filter((p: { type: string }) => p.type === "text")
        .map((p: { type: string; text?: string }) => p.text ?? "")
        .join("") ?? "";
      const code = extractCode(text);
      if (code) setPreviewCode(code);
    }
  }, [messages]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-fill from ?prompt= — do NOT auto-send, let user review first
  React.useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !promptFromUrl) {
      setPromptFromUrl(true);
      setPanelView("chat");
      setActiveTab("preview");
      setInput(decodeURIComponent(prompt));
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectTemplate(template: VercelTemplate) {
    setActiveTemplate(template);
    setPanelView("chat");
    setActiveTab("preview");
    // Pre-fill the input so the user can review and edit before sending
    const defaultPrompt = `Build the main landing/home page for the "${template.name}" template. Stack: ${template.stack.slice(0, 4).join(", ")}. Make it visually polished and production-ready with realistic copy.`;
    setInput(defaultPrompt);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input.trim() });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleCopy() {
    if (!previewCode) return;
    navigator.clipboard.writeText(previewCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const vp = VIEWPORTS.find(v => v.id === viewport)!;
  const selectedModel = MODELS.find(m => m.key === model) ?? MODELS[0];

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>

      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div className="flex flex-col w-[420px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-1)]">

        {panelView === "gallery" ? (
          <TemplateGallery onSelect={handleSelectTemplate} />
        ) : (
          /* Chat view */
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)] shrink-0">
              <button
                onClick={() => setPanelView("gallery")}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                title="Back to templates"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                {activeTemplate ? (
                  <>
                    <div className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                      CATEGORY_COLORS[activeTemplate.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/20"
                    )}>
                      {activeTemplate.category}
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--color-foreground)] truncate">{activeTemplate.name}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-indigo-500/15">
                      <Hammer className="w-3 h-3 text-indigo-400" />
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--color-foreground)]">AI Builder</span>
                  </div>
                )}
              </div>

              {/* Model selector */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setModelOpen(o => !o)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-foreground)] hover:border-indigo-500/40 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {selectedModel.label}
                  <ChevronDown className={cn("w-3 h-3 text-[var(--color-muted-foreground)] transition-transform", modelOpen && "rotate-180")} />
                </button>
                {modelOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--color-surface-4)] border border-[var(--color-border)] rounded-lg shadow-xl shadow-black/40 z-50 py-1">
                    {MODELS.map(m => (
                      <button
                        key={m.key}
                        onClick={() => { setModel(m.key); setModelOpen(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[12px] hover:bg-[var(--color-surface-3)] transition-colors",
                          m.key === model ? "text-indigo-400 font-semibold" : "text-[var(--color-foreground)]"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Template context banner */}
            {activeTemplate && (
              <div className="mx-3 mt-2 mb-0 px-3 py-2 rounded-lg bg-indigo-500/8 border border-indigo-500/15 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-indigo-300">Template context active</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] leading-relaxed line-clamp-1">
                      Stack: {activeTemplate.stack.slice(0, 3).join(", ")}{activeTemplate.stack.length > 3 ? "…" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {activeTemplate.demoUrl && (
                      <a href={activeTemplate.demoUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1 rounded-md hover:bg-indigo-500/15 text-[var(--color-muted-foreground)] hover:text-indigo-300 transition-colors"
                        title="View demo"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a href={activeTemplate.repoUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-indigo-500/15 text-[var(--color-muted-foreground)] hover:text-indigo-300 transition-colors"
                      title="View repo"
                      onClick={e => e.stopPropagation()}
                    >
                      <GitBranch className="w-3 h-3" />
                    </a>
                    <a href={activeTemplate.deployUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600/80 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-colors"
                      title="Deploy to Vercel"
                      onClick={e => e.stopPropagation()}
                    >
                      <Zap className="w-2.5 h-2.5" />Deploy
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-3 py-3">
              {messages.length === 0 ? (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-[var(--color-muted-foreground)] px-1 mb-3">
                    {activeTemplate
                      ? `Building with ${activeTemplate.name}. Describe what page or component to generate:`
                      : "Describe a component to build:"
                    }
                  </p>
                  {(activeTemplate
                    ? activeTemplate.features.map(f => `Build the ${f} feature`)
                    : [
                        "Build a pricing page with 3 tiers",
                        "Create a hero section with CTA button",
                        "Build a stats dashboard with 4 KPI cards",
                        "Create a contact form with validation",
                        "Build a feature grid with 6 items",
                        "Create a testimonials carousel",
                      ]
                  ).slice(0, 6).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); textareaRef.current?.focus(); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/40 hover:bg-[var(--color-surface-3)] transition-all group"
                    >
                      <span className="text-[12px] text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">{prompt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg) => {
                    const text = msg.parts
                      ?.filter((p: { type: string }) => p.type === "text")
                      .map((p: { type: string; text?: string }) => p.text ?? "")
                      .join("") ?? "";
                    const isUser = msg.role === "user";
                    
                    // For AI messages, check if they contain code - if so, skip entirely
                    if (!isUser) {
                      // Check for code indicators - if found, don't display this message
                      const hasCode = /```|~~~|`[^`]+`|import\s+|export\s+|const\s+\w+\s*=|function\s+\w+|className=|<[A-Z]\w+|return\s+|=>|{[\s\S]*}|\[[\s\S]*\]|\/\/|\/\*/i.test(text);
                      if (hasCode) {
                        return null; // Hide AI messages that contain code
                      }
                    }

                    const displayText = text;

                    // Hide empty messages
                    if (!displayText || !displayText.trim()) {
                      return null;
                    }

                    return (
                      <div key={msg.id} className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
                        <div className={cn(
                          "w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold border mt-0.5",
                          isUser
                            ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                            : "bg-[var(--color-surface-4)] border-[var(--color-border)]"
                        )}>
                          {isUser ? "U" : <Sparkles className="w-3 h-3 text-indigo-400" />}
                        </div>

                        <div className={cn("flex-1 min-w-0 space-y-2", isUser && "items-end flex flex-col")}>
                          <div className={cn(
                            "rounded-xl px-3 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap",
                            isUser
                              ? "bg-indigo-600/20 border border-indigo-500/20 text-[var(--color-foreground)]"
                              : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)]"
                          )}>
                            {displayText}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isStreaming && (
                    <div className="flex items-center gap-2 px-1">
                      <Loader2 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                      <span className="text-[11px] text-[var(--color-muted-foreground)]">Building...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border)] shrink-0">
              <div className="relative rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] focus-within:border-indigo-500/50 transition-colors overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeTemplate
                    ? `Describe a page or component for ${activeTemplate.name}...`
                    : "Describe the UI component you want to build..."
                  }
                  className="resize-none border-0 bg-transparent px-3 pt-3 pb-10 text-[13px] min-h-[80px] max-h-[160px] focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  rows={3}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  {isStreaming ? (
                    <Button size="sm" variant="ghost" onClick={stop} className="h-7 gap-1.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <X className="w-3 h-3" />Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="h-7 gap-1.5 text-[11px]"
                    >
                      <Send className="w-3 h-3" />Build
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-muted-foreground)]/60 mt-1.5 px-0.5">Enter to send &middot; Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Preview panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
          {panelView === "gallery" ? (
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-muted-foreground)]">
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Select a template to start building</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-0.5 bg-[var(--color-surface-3)] rounded-lg p-0.5">
                {(["preview", "code"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all capitalize",
                      activeTab === tab
                        ? "bg-[var(--color-surface-1)] text-[var(--color-foreground)] shadow-sm"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    )}
                  >
                    {tab === "preview" ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === "preview" && previewCode && (
                <div className="flex items-center gap-0.5 bg-[var(--color-surface-3)] rounded-lg p-0.5">
                  {VIEWPORTS.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setViewport(v.id)}
                      title={v.label}
                      className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewport === v.id
                          ? "bg-[var(--color-surface-1)] text-[var(--color-foreground)] shadow-sm"
                          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                      )}
                    >
                      <v.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex-1" />

          {/* Switch to chat if on gallery */}
          {panelView === "gallery" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPanelView("chat")}
              className="h-7 gap-1.5 text-[11px]"
            >
              <Hammer className="w-3 h-3" />Build without template
            </Button>
          )}

          {panelView === "chat" && isStreaming && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
              <span className="text-[11px] text-indigo-300 font-medium">Building...</span>
            </div>
          )}
          {previewCode && panelView === "chat" && !isStreaming && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="sm"
                onClick={() => setPreviewCode(null)}
                className="h-7 gap-1.5 text-[11px] text-[var(--color-muted-foreground)]"
              >
                <RotateCcw className="w-3 h-3" />Reset
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={handleCopy}
                className="h-7 gap-1.5 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy code"}
              </Button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative bg-[var(--color-surface-1)]">
          {panelView === "gallery" ? (
            /* Gallery right panel �� big welcome state */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center">
                  <LayoutTemplate className="w-9 h-9 text-[var(--color-muted-foreground)]/25" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-[17px] font-bold text-[var(--color-foreground)] mb-2 text-balance">Pick a Vercel template to start</h3>
                <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed text-balance">
                  Browse {VERCEL_TEMPLATES.length} official Next.js templates. Select one to give the AI full architectural context, then describe what to build.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {["AI Chatbot", "SaaS Starter", "E-commerce", "Blog", "Multi-tenant"].map(cat => (
                  <span key={cat} className="px-3 py-1.5 rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[11px] text-[var(--color-muted-foreground)]">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          ) : !previewCode ? (
            /* Building / empty state */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              {isStreaming ? (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center max-w-xs px-4">
                    <h3 className="text-[15px] font-semibold text-[var(--color-foreground)] mb-1.5">Building your UI...</h3>
                    <p className="text-[12px] text-[var(--color-muted-foreground)] leading-relaxed">
                      {activeTemplate ? `Generating ${activeTemplate.name} component` : "Generating component"} — preview will appear here automatically.
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center">
                      <Hammer className="w-7 h-7 text-[var(--color-muted-foreground)]/30" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-center max-w-xs px-4">
                    <h3 className="text-[15px] font-semibold text-[var(--color-foreground)] mb-1.5">Live preview appears here</h3>
                    <p className="text-[13px] text-[var(--color-muted-foreground)] leading-relaxed">
                      {activeTemplate
                        ? `Describe a page or component for ${activeTemplate.name} in the chat to see it rendered.`
                        : "Describe a UI component in the chat and it will render instantly in this sandbox."
                      }
                    </p>
                  </div>
                  {!activeTemplate && (
                    <button
                      onClick={() => setPanelView("gallery")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/25 text-indigo-300 text-[12px] font-medium hover:bg-indigo-600/30 transition-colors"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5" />
                      Browse templates
                    </button>
                  )}
                </>
              )}
            </div>
          ) : activeTab === "preview" ? (
            /* Iframe preview */
            <div className="absolute inset-0 flex items-start justify-center overflow-auto py-6 px-6 bg-[#0d0d14]">
              <div
                className="transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-[var(--color-border)]"
                style={{
                  width: vp.width,
                  minWidth: "280px",
                  maxWidth: "100%",
                  height: "calc(100vh - 130px)",
                }}
              >
                <iframe
                  key={`${previewCode.slice(0, 40)}-${viewport}`}
                  srcDoc={buildSandboxHtml(previewCode)}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0 bg-[#0a0a0f]"
                  title="Component Preview"
                />
              </div>
            </div>
          ) : (
            /* Code view */
            <ScrollArea className="h-full">
              <pre className="p-5 text-[12px] leading-relaxed font-mono text-[var(--color-foreground)]/90 whitespace-pre-wrap break-all">
                <code>{previewCode}</code>
              </pre>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>}>
      <BuilderInner />
    </React.Suspense>
  );
}
