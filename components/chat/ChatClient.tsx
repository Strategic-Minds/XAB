"use client";
import * as React from "react";
import { MessageSquare, Send, Sparkles, Bot, User, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = { role:"user"|"assistant"; content:string; time:string };

const initMessages: Message[] = [
  { role:"assistant", content:"Hello! I'm your XAB AI assistant. I can help you build websites, deploy agents, manage your CRM, and automate your business. What would you like to accomplish today?", time:"now" },
];

export default function ChatClient() {
  const [messages, setMessages] = React.useState<Message[]>(initMessages);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role:"user", content:input.trim(), time:"now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const aiMsg: Message = { role:"assistant", content:"I'm processing your request. This feature connects to the XAB AI backend. Make sure your OPENAI_API_KEY and NEXT_PUBLIC_SUPABASE_URL environment variables are configured for full functionality.", time:"now" };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-background)]">
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--color-foreground)] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[var(--color-primary)]" /> AI Chat</h1>
          <p className="text-[13px] text-[var(--color-muted-foreground)] mt-0.5">Powered by XAB Intelligence</p>
        </div>
        <Button variant="outline" className="h-8 px-3 text-[13px] border-[var(--color-border)] gap-1.5"><Plus className="w-3.5 h-3.5"/>New Chat</Button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m,i)=>(
          <div key={i} className={cn("flex gap-3 max-w-3xl", m.role==="user" && "ml-auto flex-row-reverse")}>
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", m.role==="assistant" ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-surface-3)]")}>
              {m.role==="assistant" ? <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]"/> : <User className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]"/>}
            </div>
            <div className={cn("rounded-xl px-4 py-2.5 text-[13px] leading-relaxed max-w-xl", m.role==="assistant" ? "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-foreground)]" : "bg-[var(--color-primary)] text-white")}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]"/></div>
            <div className="rounded-xl px-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)]">
              <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted-foreground)] animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div className="border-t border-[var(--color-border)] px-6 py-4 shrink-0">
        <div className="flex gap-2">
          <Input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && handleSend()} placeholder="Message XAB AI..." className="flex-1 h-9 text-[13px] bg-[var(--color-surface-2)] border-[var(--color-border)]"/>
          <Button onClick={handleSend} disabled={!input.trim()||loading} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white h-9 px-4"><Send className="w-4 h-4"/></Button>
        </div>
      </div>
    </div>
  );
}
