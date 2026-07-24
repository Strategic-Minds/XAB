"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AppChatPanel() {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();

  const isStreaming = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    void sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-[380px] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-1)]">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/15">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-[12px] font-semibold text-[var(--color-foreground)]">AI Assistant</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {messages.length === 0 ? (
          <div className="space-y-3 pt-2">
            <p className="text-[11px] text-[var(--color-muted-foreground)] px-1">How can I help you today?</p>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const content = typeof msg.content === "string" ? msg.content : "";
              if (!content.trim()) return null;
              return (
                <div key={msg.id} className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
                  <div className={cn(
                    "w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold border mt-0.5",
                    isUser ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                           : "bg-[var(--color-surface-4)] border-[var(--color-border)]"
                  )}>
                    {isUser ? "U" : <Sparkles className="w-3 h-3 text-indigo-400" />}
                  </div>
                  <div className={cn("flex-1 min-w-0", isUser && "items-end flex flex-col")}>
                    <div className={cn(
                      "rounded-lg px-3 py-2 text-[12px] leading-relaxed max-w-xs",
                      isUser ? "bg-indigo-600/20 border border-indigo-500/20 text-[var(--color-foreground)]"
                             : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)]"
                    )}>
                      {content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-1)] p-3 shrink-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="w-full resize-none rounded-lg border bg-[var(--color-surface-2)] p-2.5 pr-10 text-[12px] placeholder-[var(--color-muted-foreground)] focus:outline-none disabled:opacity-50 text-[var(--color-foreground)]"
            rows={3}
          />
          <div className="absolute bottom-2 right-2">
            {isStreaming ? (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" disabled type="button">
                <Loader2 className="w-3 h-3 animate-spin" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-7 gap-1 text-[11px]" type="button">
                <Send className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
