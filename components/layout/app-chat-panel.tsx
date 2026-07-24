"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

// Minimal chat panel — full implementation wired via /api/chat
export function AppChatPanel() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: text }] }),
      });
      const data = await res.json() as { content?: string; error?: string };
      setMessages((m) => [...m, { role: "assistant", text: data.content ?? data.error ?? "Error" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Connection error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-[380px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--color-border)] shrink-0">
        <div className="p-1 rounded-md bg-indigo-500/15">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span className="text-[12px] font-semibold text-[var(--color-foreground)]">AI Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-[11px] text-[var(--color-muted-foreground)] pt-2">How can I help you today?</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`rounded-lg px-3 py-2 text-[12px] max-w-[260px] leading-relaxed
              ${m.role === "user"
                ? "bg-indigo-600/20 border border-indigo-500/20 text-[var(--color-foreground)]"
                : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)]"
              }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--color-border)] p-3 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask me anything..."
            disabled={loading}
            rows={2}
            className="flex-1 resize-none rounded-lg border bg-[var(--color-surface-2)] p-2 text-[12px] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || loading}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-[12px] disabled:opacity-40 hover:bg-indigo-500 transition-colors"
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
