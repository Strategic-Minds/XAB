"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function summarizeValue(value: unknown, maxLength = 120): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value.slice(0, maxLength);

  try {
    return JSON.stringify(value).slice(0, maxLength);
  } catch {
    return "[unserializable value]";
  }
}

export function AppChatPanel() {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { messages, append, status } = useChat();
  const isStreaming = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    setInput("");

    try {
      await append({ role: "user", content });
    } catch (error) {
      setInput(content);
      console.error("Failed to send chat message", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
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
            {messages.map((message) => {
              const isUser = message.role === "user";
              const text =
                message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => part.text ?? "")
                  .join("") ?? "";
              const toolParts = message.parts?.filter((part) => part.type === "tool-invocation") ?? [];

              if (!text.trim() && toolParts.length === 0) return null;

              return (
                <div key={message.id} className="space-y-2">
                  {toolParts.map((part, index) => {
                    const invocation = part.toolInvocation;
                    const hasResult = invocation.state === "result";
                    const detail = hasResult
                      ? summarizeValue(invocation.result)
                      : summarizeValue(invocation.args);

                    return (
                      <div key={`${message.id}-tool-${invocation.toolCallId}-${index}`} className="flex gap-2.5">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold border mt-0.5",
                            hasResult
                              ? "bg-green-500/20 border-green-500/30"
                              : "bg-amber-500/20 border-amber-500/30"
                          )}
                        >
                          {hasResult ? "✓" : "⚙"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 text-[12px] leading-relaxed border text-[var(--color-foreground)]",
                              hasResult
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-amber-500/10 border-amber-500/20"
                            )}
                          >
                            <div className={cn("font-semibold", hasResult ? "text-green-300" : "text-amber-300")}>
                              {hasResult ? "Completed" : "Running"}: {invocation.toolName}
                            </div>
                            {detail && <div className="text-[11px] mt-1 opacity-75 break-words">{detail}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {text.trim() && (
                    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold border mt-0.5",
                          isUser
                            ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                            : "bg-[var(--color-surface-4)] border-[var(--color-border)]"
                        )}
                      >
                        {isUser ? "U" : <Sparkles className="w-3 h-3 text-indigo-400" />}
                      </div>

                      <div className={cn("flex-1 min-w-0", isUser && "items-end flex flex-col")}>
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-[12px] leading-relaxed max-w-xs whitespace-pre-wrap break-words",
                            isUser
                              ? "bg-indigo-600/20 border border-indigo-500/20 text-[var(--color-foreground)]"
                              : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-foreground)]"
                          )}
                        >
                          {text}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-1)] p-3 shrink-0">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isStreaming}
            className="resize-none rounded-lg border bg-[var(--color-surface-2)] p-2.5 text-[12px] placeholder-[var(--color-muted-foreground)] focus-visible:outline-none disabled:opacity-50"
            rows={3}
          />
          <div className="absolute bottom-2 right-2">
            {isStreaming ? (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-[11px]" disabled>
                <Loader2 className="w-3 h-3 animate-spin" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => void handleSend()} disabled={!input.trim()} className="h-7 gap-1 text-[11px]">
                <Send className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
