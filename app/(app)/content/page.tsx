"use client";

import * as React from "react";
import {
  FileText, Plus, Bot, Wand2, Hash, Globe, Mail, Share2,
  X, BarChart3, Eye, Copy, Download, CheckCircle2,
  Loader2, Sparkles, ChevronRight, Tag, RefreshCw, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn , fetcher } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import useSWR from "swr";
import type { ContentItem } from "@/lib/types";


const typeConfig = {
  blog: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Blog Post" },
  linkedin: { icon: Share2, color: "text-blue-400", bg: "bg-blue-500/10", label: "LinkedIn" },
  twitter: { icon: X, color: "text-sky-400", bg: "bg-sky-500/10", label: "Twitter / X" },
  email: { icon: Mail, color: "text-amber-400", bg: "bg-amber-500/10", label: "Email" },
  seo: { icon: Hash, color: "text-green-400", bg: "bg-green-500/10", label: "SEO" },
  landing: { icon: Globe, color: "text-violet-400", bg: "bg-violet-500/10", label: "Landing Page" },
};

const statusVariant = {
  draft: "muted" as const,
  review: "warning" as const,
  published: "success" as const,
  archived: "muted" as const,
};

const templates = [
  { type: "blog", label: "Thought Leadership Blog", description: "800-1200 word expert article" },
  { type: "linkedin", label: "LinkedIn Post", description: "Engaging post with hook + value" },
  { type: "twitter", label: "Tweet Thread", description: "10-tweet educational thread" },
  { type: "email", label: "Cold Outreach Email", description: "Personalized B2B email" },
  { type: "seo", label: "SEO Landing Page", description: "Keyword-optimized page copy" },
  { type: "landing", label: "Product Landing Page", description: "Conversion-focused copy" },
];

export default function ContentPage() {
  const { data: allContent = [], mutate } = useSWR<ContentItem[]>("/api/content", fetcher);
  const [selectedContent, setSelectedContent] = React.useState<ContentItem | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [topic, setTopic] = React.useState("");
  const [activeType, setActiveType] = React.useState<keyof typeof typeConfig>("blog");
  const [copied, setCopied] = React.useState(false);

  const displayContent = selectedContent ?? allContent[0] ?? null;

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: topic.trim(),
          type: activeType,
          status: "draft",
          content: `# ${topic.trim()}\n\nThis ${typeConfig[activeType].label} is about: ${topic.trim()}. Click Regenerate to generate real AI content.`,
          excerpt: topic.trim(),
          tags: [],
          seo_score: 0,
          views: 0,
          clicks: 0,
          shares: 0,
        }),
      });
      if (res.ok) {
        const item = await res.json();
        mutate();
        setSelectedContent(item);
        setTopic("");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    const text = displayContent?.content ?? displayContent?.excerpt ?? "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Content Engine</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            AI-generated blog posts, social content, emails, and SEO copy.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-3.5 h-3.5" />New Content
        </Button>
      </div>

      {/* Generation panel */}
      <Card className="border-[var(--color-primary)]/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
            <h2 className="text-sm font-bold text-[var(--color-foreground)]">AI Content Generator</h2>
          </div>
          <div className="flex gap-3 mb-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic, keyword, or paste a brief..."
              className="flex-1"
            />
            <Button onClick={handleGenerate} disabled={generating} className="gap-2 shrink-0">
              {generating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
              ) : (
                <><Wand2 className="w-3.5 h-3.5" />Generate</>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {templates.map((tpl) => {
              const cfg = typeConfig[tpl.type as keyof typeof typeConfig];
              const Icon = cfg.icon;
              const isActive = activeType === tpl.type;
              return (
                <button
                  key={tpl.type}
                  onClick={() => setActiveType(tpl.type as keyof typeof typeConfig)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer group",
                    isActive
                      ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-3)]"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", cfg.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                  </div>
                  <span className={cn("text-[10px] font-medium text-center leading-tight", isActive ? "text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]")}>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">Content Library</h2>
            <Badge variant="muted">{allContent.length} items</Badge>
          </div>
          {allContent.map((item) => {
            const cfg = typeConfig[item.type as keyof typeof typeConfig] ?? typeConfig.blog;
            const Icon = cfg.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedContent(item)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                  displayContent?.id === item.id
                    ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn("p-1.5 rounded shrink-0 mt-0.5", cfg.bg)}>
                    <Icon className={cn("w-3 h-3", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">{item.title}</span>
                      <Badge variant={statusVariant[item.status as keyof typeof statusVariant] ?? "muted"}>{item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)]">
                      <span>{cfg.label}</span>
                      <span>·</span>
                      <RelativeTime date={item.createdAt} />
                    </div>
                    {item.views > 0 && (
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className="text-[var(--color-muted-foreground)]">
                          <Eye className="w-2.5 h-2.5 inline mr-0.5" />{item.views.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content detail */}
        <div className="lg:col-span-2">
          {displayContent && (() => {
            const cfg = typeConfig[displayContent.type as keyof typeof typeConfig] ?? typeConfig.blog;
            const Icon = cfg.icon;
            return (
              <Tabs defaultValue="content">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[var(--color-foreground)]">{displayContent.title}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={statusVariant[displayContent.status as keyof typeof statusVariant] ?? "muted"}>{displayContent.status}</Badge>
                        <span className="text-[10px] text-[var(--color-muted-foreground)]">{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={() => { const text = displayContent?.content ?? ""; const blob = new Blob([text], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${displayContent?.title ?? "content"}.txt`; a.click(); URL.revokeObjectURL(url); }}>
                      <Download className="w-3.5 h-3.5" />Export
                    </Button>
                  </div>
                </div>

                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <Card>
                    <CardContent className="p-5">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
                          {displayContent.content ?? displayContent.excerpt}
                        </p>
                      </div>
                      {displayContent.tags && displayContent.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[var(--color-border)]">
                          {displayContent.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo">
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      {displayContent.seoScore > 0 ? (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-[var(--color-foreground)]">SEO Score</span>
                              <span className={cn(
                                "text-sm font-bold",
                                displayContent.seoScore >= 80 ? "text-green-400" : displayContent.seoScore >= 60 ? "text-amber-400" : "text-red-400"
                              )}>
                                {displayContent.seoScore}/100
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)]">
                              <div
                                className={cn("h-2 rounded-full transition-all", displayContent.seoScore >= 80 ? "bg-green-500" : displayContent.seoScore >= 60 ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${displayContent.seoScore}%` }}
                              />
                            </div>
                          </div>
                          {displayContent.keywords && displayContent.keywords.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-[var(--color-foreground)] mb-2">Target Keywords</div>
                              <div className="flex flex-wrap gap-1.5">
                                {displayContent.keywords.map((kw) => (
                                  <span key={kw} className="px-2 py-0.5 text-[10px] rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-[var(--color-muted-foreground)]">No SEO analysis available</p>
                          <Button size="sm" className="mt-3 gap-1.5"><Wand2 className="w-3.5 h-3.5" />Run SEO Analysis</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance">
                  <Card>
                    <CardContent className="p-5">
                      {displayContent.views > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: "Views", value: displayContent.views.toLocaleString() },
                            { label: "Clicks", value: displayContent.clicks?.toLocaleString() ?? "—" },
                            { label: "Shares", value: displayContent.shares?.toLocaleString() ?? "—" },
                          ].map((m) => (
                            <div key={m.label} className="text-center p-4 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)]">
                              <div className="text-xl font-bold text-[var(--color-foreground)]">{m.value}</div>
                              <div className="text-xs text-[var(--color-muted-foreground)] mt-1">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm text-[var(--color-muted-foreground)]">No performance data yet</p>
                          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Publish content to track metrics</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
