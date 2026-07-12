"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send, Plus, Search, Sparkles, User, Code2,
  Copy, Pin, ChevronDown, Check, MessageSquare,
  Globe, Zap, Brain, TrendingUp, X, PanelRight,
  Cpu, Network, Database, StopCircle,
  ThumbsUp, ThumbsDown, Share2, BookOpen, Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";

/* ─── Model definitions ──────────────────────────────────────── */
const models = [
  // OpenAI
  { id: "gpt-4o",           label: "GPT-4o",             provider: "OpenAI",    tokens: "128k", badge: "Default" },
  { id: "gpt-4o-mini",      label: "GPT-4o Mini",        provider: "OpenAI",    tokens: "128k", badge: null },
  { id: "gpt-4.1",          label: "GPT-4.1",            provider: "OpenAI",    tokens: "1M",   badge: null },
  { id: "gpt-4.1-mini",     label: "GPT-4.1 Mini",       provider: "OpenAI",    tokens: "1M",   badge: null },
  { id: "gpt-5",            label: "GPT-5",              provider: "OpenAI",    tokens: "1M",   badge: "New" },
  { id: "o3",               label: "o3",                 provider: "OpenAI",    tokens: "200k", badge: null },
  { id: "o4-mini",          label: "o4-mini",            provider: "OpenAI",    tokens: "200k", badge: null },
  // Anthropic
  { id: "claude-sonnet-4",  label: "Claude Sonnet 4",    provider: "Anthropic", tokens: "200k", badge: null },
  { id: "claude-sonnet-4.5",label: "Claude Sonnet 4.5",  provider: "Anthropic", tokens: "200k", badge: null },
  { id: "claude-sonnet-5",  label: "Claude Sonnet 5",    provider: "Anthropic", tokens: "200k", badge: "New" },
  { id: "claude-opus-4",    label: "Claude Opus 4",      provider: "Anthropic", tokens: "200k", badge: null },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5",   provider: "Anthropic", tokens: "200k", badge: null },
  // Google
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash",   provider: "Google",    tokens: "1M",   badge: null },
  { id: "gemini-2.5-pro",   label: "Gemini 2.5 Pro",     provider: "Google",    tokens: "1M",   badge: null },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash",   provider: "Google",    tokens: "1M",   badge: "New" },
];

const providerColor: Record<string, string> = {
  OpenAI:    "text-green-400",
  Anthropic: "text-orange-400",
  Google:    "text-blue-400",
};

/* ─── Suggested prompts ──────────────────────────────────────── */
const suggestedPrompts = [
  { icon: TrendingUp, text: "Summarize this week's lead activity",        color: "text-indigo-400", bg: "bg-indigo-500/8 hover:bg-indigo-500/14" },
  { icon: Globe,      text: "Research top 5 competitors in our space",    color: "text-violet-400", bg: "bg-violet-500/8 hover:bg-violet-500/14" },
  { icon: Zap,        text: "Create a follow-up workflow for cold leads",  color: "text-amber-400",  bg: "bg-amber-500/8 hover:bg-amber-500/14"  },
  { icon: Brain,      text: "What should I prioritize today?",             color: "text-green-400",  bg: "bg-green-500/8 hover:bg-green-500/14"  },
  { icon: Code2,      text: "Generate CRM data export script",            color: "text-cyan-400",   bg: "bg-cyan-500/8 hover:bg-cyan-500/14"    },
  { icon: Database,   text: "Analyze customer churn signals this month",  color: "text-rose-400",   bg: "bg-rose-500/8 hover:bg-rose-500/14"    },
];

/* ─── Context panel items ─────────────────────────────────────── */
const contextItems = [
  { icon: Database, label: "CRM Access",  status: "active"   },
  { icon: Brain,    label: "Memory",       status: "active"   },
  { icon: BookOpen, label: "Knowledge",    status: "active"   },
  { icon: Network,  label: "Web Search",   status: "inactive" },
  { icon: Cpu,      label: "Code Exec",    status: "inactive" },
];

/* ─── Types ──────────────────────────────────────────────────── */
type ConvType = { id: string; title: string; pinned?: boolean; updated_at: string; model?: string };

/* ─── Helpers ────────────────────────────────────────────────── */
function getTextContent(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter(p => p.type === "text")
    .map(p => p.text ?? "")
    .join("");
}

/* ─── Message bubble ─────────────────────────────────────────── */
function MessageBubble({
  role, parts, createdAt, copiedId, msgId, onCopy,
}: {
  role: string;
  parts: Array<{ type: string; text?: string }>;
  createdAt?: Date;
  copiedId: string | null;
  msgId: string;
  onCopy: (id: string, text: string) => void;
}) {
  const isUser = role === "user";
  const content = getTextContent(parts);

  return (
    <div className={cn("group flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border",
        isUser
          ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)]/30"
          : "bg-[var(--color-surface-3)] border-[var(--color-border)]",
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          : <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        }
      </div>

      <div className={cn("flex flex-col gap-1 max-w-[84%]", isUser && "items-end")}>
        <div className={cn(
          "rounded-xl px-4 py-3 leading-relaxed",
          isUser
            ? "bg-[var(--color-primary)] text-white rounded-tr-none text-sm"
            : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-tl-none",
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center gap-0.5 transition-opacity",
          !isUser ? "opacity-0 group-hover:opacity-100" : "opacity-0",
        )}>
          {!isUser && (
            <>
              <ActionBtn icon={copiedId === msgId ? Check : Copy} label={copiedId === msgId ? "Copied" : "Copy"} onClick={() => onCopy(msgId, content)} active={copiedId === msgId} />
              <ActionBtn icon={ThumbsUp} label="Good" onClick={() => {}} />
              <ActionBtn icon={ThumbsDown} label="Bad" onClick={() => {}} />
              <ActionBtn icon={Share2} label="Share" onClick={() => {}} />
            </>
          )}
          {createdAt && (
            <span className="ml-2 text-[10px] text-[var(--color-muted-foreground)]/60 tabular-nums">
              <RelativeTime date={createdAt} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon, label, onClick, active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] transition-colors cursor-pointer",
        active
          ? "text-green-400"
          : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-2)]",
      )}
    >
      <Icon className="w-3 h-3" />
    </button>
  );
}

function StreamingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)] animate-pulse" />
      </div>
      <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────���───────────────────────── */
// Prompts that should redirect to the builder instead of chatting
const BUILD_PATTERNS = [
  // verb + output type
  /\b(build|create|generate|make|design|write|code|develop)\b.{0,40}(website|web site|landing page|webpage|home ?page|portfolio|one-?pager|site|html page|template|funnel|sales page|product page|coming soon|splash page)/i,
  // output type + verb
  /\b(website|landing page|homepage|portfolio|template|site|funnel|web page)\b.{0,30}(build|create|generate|make|design|for me|please)/i,
  // standalone strong signals
  /\b(build me a|make me a|create me a|generate a|design a)\b.{0,60}(page|site|web|html|template)/i,
  // "I need a website", "I want a landing page"
  /\b(i need|i want|can you make|can you build|can you create|can you design)\b.{0,40}(website|landing page|web page|homepage|site|template)/i,
];

function isBuildPrompt(text: string) {
  return BUILD_PATTERNS.some((p) => p.test(text));
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: conversations = [] } = useSWR<ConvType[]>("/api/chat-conversations", fetcher);
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState(models[0]);
  const [showModelPicker, setShowModelPicker] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [showContext, setShowContext] = React.useState(true);
  const [sidebarSearch, setSidebarSearch] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const modelPickerRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel.id,
      conversationId: activeConvId,
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset to new conversation when ?new=1 is in the URL
  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setActiveConvId(null);
      router.replace("/chat");
    }
  }, [searchParams, router]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    // Redirect build/site prompts to the website builder
    if (isBuildPrompt(text)) {
      router.push(`/website-factory?prompt=${encodeURIComponent(text)}`);
      setInput("");
      return;
    }
    sendMessage({ text });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeConvTitle = conversations.find((c: ConvType) => c.id === activeConvId)?.title ?? "New Conversation";
  const filteredConvs = conversations.filter((c: ConvType) =>
    !sidebarSearch || c.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const pinned = filteredConvs.filter((c: ConvType) => c.pinned);
  const recent = filteredConvs.filter((c: ConvType) => !c.pinned);

  return (
    <div className="flex h-full bg-[var(--color-surface-0)]">

      {/* ── Conversation sidebar ───────────────────────────── */}
      <aside className="w-[220px] shrink-0 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-surface-1)]">
        <div className="p-2.5 border-b border-[var(--color-border)]">
          <Button
            size="sm"
            className="w-full gap-1.5 h-7 text-[12px]"
            onClick={() => setActiveConvId(null)}
          >
            <Plus className="w-3.5 h-3.5" />
            New conversation
          </Button>
        </div>

        <div className="px-2.5 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted-foreground)]" />
            <input
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-3 h-7 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[12px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]"
            />
            {sidebarSearch && (
              <button onClick={() => setSidebarSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                <X className="w-3 h-3 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="pb-4 space-y-3">
            {pinned.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-[var(--color-muted-foreground)]/60 uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <Pin className="w-2.5 h-2.5" />Pinned
                </div>
                <div className="space-y-px">
                  {pinned.map((conv: ConvType) => (
                    <ConvItem key={conv.id} conv={conv} active={activeConvId === conv.id} pinned onClick={() => setActiveConvId(conv.id)} />
                  ))}
                </div>
              </div>
            )}
            {recent.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-semibold text-[var(--color-muted-foreground)]/60 uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <Clock3 className="w-2.5 h-2.5" />Recent
                </div>
                <div className="space-y-px">
                  {recent.map((conv: ConvType) => (
                    <ConvItem key={conv.id} conv={conv} active={activeConvId === conv.id} onClick={() => setActiveConvId(conv.id)} />
                  ))}
                </div>
              </div>
            )}
            {conversations.length === 0 && (
              <div className="py-8 text-center">
                <MessageSquare className="w-6 h-6 text-[var(--color-muted-foreground)] mx-auto mb-2 opacity-40" />
                <p className="text-[11px] text-[var(--color-muted-foreground)]">No conversations yet</p>
                <p className="text-[10px] text-[var(--color-muted-foreground)]/60 mt-0.5">Start chatting to create one</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ── Chat area ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
            <span className="text-[13px] font-semibold text-[var(--color-foreground)] truncate">{activeConvTitle}</span>
            {isStreaming && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-green-400 border-green-400/30 animate-pulse">
                Live
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Model picker */}
            <div className="relative" ref={modelPickerRef}>
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[12px] font-medium text-[var(--color-foreground)] hover:border-[var(--color-primary)]/50 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                <span>{selectedModel.label}</span>
                <ChevronDown className="w-3 h-3 text-[var(--color-muted-foreground)]" />
              </button>

              {showModelPicker && (
                <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-2xl shadow-black/40 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-muted-foreground)] font-semibold uppercase tracking-wider">Select Model</p>
                  </div>
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setShowModelPicker(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-[12px] hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer text-left",
                        selectedModel.id === model.id && "bg-[var(--color-surface-3)]",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--color-foreground)]">{model.label}</span>
                          {model.badge && (
                            <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0">{model.badge}</Badge>
                          )}
                        </div>
                        <span className={cn("text-[10px]", providerColor[model.provider])}>{model.provider}</span>
                      </div>
                      <span className="text-[10px] text-[var(--color-muted-foreground)] shrink-0">{model.tokens}</span>
                      {selectedModel.id === model.id && <Check className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowContext(!showContext)}
              className={showContext ? "bg-[var(--color-surface-2)] text-[var(--color-foreground)]" : ""}
            >
              <PanelRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages + context panel */}
        <div className="flex flex-1 min-h-0">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
              {messages.length === 0 ? (
                <EmptyState onPrompt={(text) => { setInput(text); textareaRef.current?.focus(); }} />
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msgId={msg.id}
                    role={msg.role}
                    parts={msg.parts as Array<{ type: string; text?: string }>}
                    copiedId={copiedId}
                    onCopy={handleCopy}
                  />
                ))
              )}
              {isStreaming && messages[messages.length - 1]?.role === "user" && <StreamingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Context panel */}
          {showContext && (
            <aside className="w-[200px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface-1)] flex flex-col">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-border)]">
                <span className="text-[11px] font-semibold text-[var(--color-foreground)] uppercase tracking-wider">Context</span>
                <button onClick={() => setShowContext(false)} className="cursor-pointer text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5 space-y-1.5 flex-1">
                {contextItems.map(item => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-md border text-[11px] transition-colors",
                      item.status === "active"
                        ? "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-foreground)]"
                        : "bg-transparent border-[var(--color-border)]/40 text-[var(--color-muted-foreground)] opacity-50",
                    )}
                  >
                    <item.icon className={cn("w-3.5 h-3.5 shrink-0", item.status === "active" ? "text-[var(--color-primary)]" : "")} />
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    <div className={cn("status-dot shrink-0", item.status === "active" ? "online" : "offline")} />
                  </div>
                ))}
              </div>
              <div className="p-2.5 border-t border-[var(--color-border)]">
                <div className="text-[10px] text-[var(--color-muted-foreground)] mb-1.5 font-semibold uppercase tracking-wider">Active model</div>
                <div className="text-[12px] font-medium text-[var(--color-foreground)]">{selectedModel.label}</div>
                <div className={cn("text-[10px] mt-0.5", providerColor[selectedModel.provider])}>{selectedModel.provider} &middot; {selectedModel.tokens}</div>
              </div>
            </aside>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-1)] shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              "relative bg-[var(--color-surface-2)] border rounded-xl transition-colors",
              isStreaming ? "border-[var(--color-primary)]/40" : "border-[var(--color-border)] focus-within:border-[var(--color-primary)]/60",
            )}>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder={`Message ${selectedModel.label}…`}
                className="min-h-[72px] max-h-[220px] border-0 bg-transparent focus-visible:ring-0 resize-none py-3 px-4 pr-14 text-[13px] leading-relaxed placeholder:text-[var(--color-muted-foreground)]"
              />
              <div className="flex items-center justify-end px-3 pb-2.5 gap-2">
                <span className="text-[10px] text-[var(--color-muted-foreground)] hidden sm:block">
                  {isStreaming ? (
                    <span className="flex items-center gap-1 text-[var(--color-primary)]">
                      <span className="typing-dot" style={{width:"4px",height:"4px"}} />
                      Generating…
                    </span>
                  ) : input.length > 0 ? (
                    <span>Enter to send &middot; Shift+Enter for newline</span>
                  ) : null}
                </span>
                {isStreaming ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={stop}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <StopCircle className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon-sm"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="shadow-md shadow-indigo-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] text-[var(--color-muted-foreground)]/50 mt-2">
              XAB can make mistakes. Verify important outputs independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" /></div>}>
      <ChatPageInner />
    </React.Suspense>
  );
}

/* ─── Conversation list item ────────────────────────────────── */
function ConvItem({
  conv, active, pinned, onClick,
}: {
  conv: ConvType;
  active: boolean;
  pinned?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-2 rounded-lg transition-colors cursor-pointer group",
        active
          ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
          : "hover:bg-[var(--color-surface-2)] text-[var(--color-muted-foreground)]",
      )}
    >
      <div className="flex items-start gap-1.5">
        {pinned && <Pin className="w-2.5 h-2.5 text-indigo-400 shrink-0 mt-0.5" />}
        <span className={cn(
          "text-[12px] font-medium truncate flex-1",
          active ? "text-[var(--color-foreground)]" : "text-[var(--color-foreground)]/80",
        )}>
          {conv.title}
        </span>
      </div>
      <RelativeTime date={new Date(conv.updated_at)} className={cn("text-[10px] mt-0.5 block", pinned ? "pl-4" : "")} />
    </button>
  );
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-base font-semibold text-[var(--color-foreground)] text-balance">How can I help you today?</h3>
        <p className="text-[13px] text-[var(--color-muted-foreground)] max-w-xs text-balance">
          Your autonomous AI business OS. Ask anything, run agents, build workflows.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPrompt(p.text)}
            className={cn(
              "flex items-start gap-2.5 p-3 rounded-xl border border-[var(--color-border)] text-left transition-all cursor-pointer",
              p.bg,
            )}
          >
            <p.icon className={cn("w-4 h-4 shrink-0 mt-0.5", p.color)} />
            <span className="text-[12px] text-[var(--color-foreground)] leading-snug">{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
