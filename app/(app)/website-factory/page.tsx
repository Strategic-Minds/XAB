"use client";

import * as React from "react";
import {
  Globe, Plus, Play, Eye, Download, Code2, Smartphone, Monitor,
  Tablet, CheckCircle2, Clock, Loader2, Layers, Paintbrush,
  LayoutTemplate, ShoppingCart, User2, Building2, ChevronRight,
  Sparkles, ExternalLink, Copy, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WebsiteProject {
  id: string;
  name: string;
  type: "landing" | "saas" | "marketing" | "portal" | "dashboard" | "ecommerce";
  status: "building" | "ready" | "deployed" | "draft";
  url?: string;
  progress?: number;
  pages: number;
  createdAt: string;
  preview?: string;
}

const websiteProjects: WebsiteProject[] = [];

const siteTypes = [
  { type: "landing", icon: Layers, label: "Landing Page", description: "High-converting single page", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { type: "saas", icon: Globe, label: "SaaS Website", description: "Full SaaS marketing site", color: "text-violet-400", bg: "bg-violet-500/10" },
  { type: "marketing", icon: Paintbrush, label: "Marketing Site", description: "Multi-page marketing", color: "text-pink-400", bg: "bg-pink-500/10" },
  { type: "portal", icon: User2, label: "Client Portal", description: "Secure client workspace", color: "text-amber-400", bg: "bg-amber-500/10" },
  { type: "dashboard", icon: LayoutTemplate, label: "Admin Dashboard", description: "Data-rich admin interface", color: "text-green-400", bg: "bg-green-500/10" },
  { type: "ecommerce", icon: ShoppingCart, label: "E-Commerce", description: "Product catalog + checkout", color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const statusConfig = {
  deployed: { variant: "success" as const, label: "Deployed" },
  ready: { variant: "primary" as const, label: "Ready" },
  building: { variant: "warning" as const, label: "Building" },
  draft: { variant: "muted" as const, label: "Draft" },
};

const viewports = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

export default function WebsiteFactoryPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = React.useState<WebsiteProject | null>(null);
  const [viewport, setViewport] = React.useState("desktop");
  const [prompt, setPrompt] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("landing");

  function handleGenerate() {
    if (!prompt.trim()) return;
    const siteType = siteTypes.find(t => t.type === selectedType);
    const fullPrompt = `Build a ${siteType?.label ?? selectedType}: ${prompt.trim()}. Make it visually polished, production-ready, with realistic copy and Tailwind CSS styling.`;
    router.push(`/builder?prompt=${encodeURIComponent(fullPrompt)}`);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-foreground)]">Website Factory</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Generate production-ready websites, landing pages, portals, and dashboards from prompts.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-3.5 h-3.5" />
          New Website
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Sites Generated", value: "47", icon: Globe, color: "text-[var(--color-primary)]" },
          { label: "Deployed", value: "31", icon: CheckCircle2, color: "text-green-400" },
          { label: "In Progress", value: "3", icon: Loader2, color: "text-amber-400" },
          { label: "Total Pages", value: "284", icon: Layers, color: "text-violet-400" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-surface-3)]">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <div className="text-lg font-bold text-[var(--color-foreground)]">{stat.value}</div>
                <div className="text-[11px] text-[var(--color-muted-foreground)]">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="projects">My Sites</TabsTrigger>
        </TabsList>

        {/* Generate tab */}
        <TabsContent value="generate" className="space-y-6">
          {/* Type selector */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">Site Type</h2>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {siteTypes.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all cursor-pointer",
                    selectedType === t.type
                      ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-3)]"
                  )}
                >
                  <div className={cn("p-2.5 rounded-lg", t.bg)}>
                    <t.icon className={cn("w-4 h-4", t.color)} />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-semibold text-[var(--color-foreground)]">{t.label}</div>
                    <div className="text-[9px] text-[var(--color-muted-foreground)] mt-0.5 leading-tight">{t.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt builder */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <CardTitle>Describe Your Website</CardTitle>
              </div>
              <CardDescription>Describe the site you want to generate. Be specific about industry, tone, and features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Create a modern SaaS landing page for an AI workflow automation tool. Dark theme, professional tone. Include hero with CTA, features grid with 6 items, pricing with 3 tiers (Starter $29, Pro $79, Enterprise custom), testimonials section, and a FAQ. Use indigo as the primary accent color."
                className="w-full min-h-[120px] px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-ring)] resize-none"
              />

              {/* Quick inserts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[var(--color-muted-foreground)]">Add:</span>
                {["Dark theme", "CTA hero", "Pricing table", "Testimonials", "FAQ", "Newsletter", "Contact form"].map((snippet) => (
                  <button
                    key={snippet}
                    onClick={() => setPrompt(p => p + (p ? ", " : "") + snippet.toLowerCase())}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)]/40 transition-colors cursor-pointer"
                  >
                    + {snippet}
                  </button>
                ))}
              </div>

              {/* Reference URL */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                  <Input
                    placeholder="Reference URL to clone design style from (optional)"
                    className="pl-9"
                  />
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                  Capture
                </Button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={!prompt.trim()}>Preview Structure</Button>
                <Button className="gap-2" onClick={handleGenerate} disabled={!prompt.trim()}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects tab */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project list */}
            <div className="space-y-2">
              {websiteProjects.map((project) => {
                const typeConf = siteTypes.find(t => t.type === project.type)!;
                const stat = statusConfig[project.status];
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
                      selectedProject?.id === project.id
                        ? "bg-[var(--color-surface-3)] border-[var(--color-primary)]/30"
                        : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                    )}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <typeConf.icon className={cn("w-3.5 h-3.5 shrink-0", typeConf.color)} />
                        <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">{project.name}</span>
                      </div>
                      <Badge variant={stat.variant}>{stat.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted-foreground)]">
                      <span>{project.pages} pages</span>
                      <span>·</span>
                      <span>{project.createdAt}</span>
                    </div>
                    {project.status === "building" && project.progress && (
                      <Progress value={project.progress} className="mt-2 h-1" />
                    )}
                    {project.url && (
                      <div className="text-[10px] text-indigo-400 font-mono mt-1.5 truncate">{project.url}</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preview panel */}
            <div className="lg:col-span-2 space-y-4">
              {selectedProject && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-foreground)]">{selectedProject.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={statusConfig[selectedProject.status].variant}>
                          {statusConfig[selectedProject.status].label}
                        </Badge>
                        <span className="text-[11px] text-[var(--color-muted-foreground)]">{selectedProject.pages} pages</span>
                        {selectedProject.url && (
                          <a href="#" className="text-[11px] text-indigo-400 font-mono flex items-center gap-1 hover:underline">
                            {selectedProject.url} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Viewport toggle */}
                      <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
                        {viewports.map((vp) => (
                          <button
                            key={vp.id}
                            onClick={() => setViewport(vp.id)}
                            className={cn(
                              "p-1.5 transition-colors cursor-pointer",
                              viewport === vp.id
                                ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)]"
                                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                            )}
                          >
                            <vp.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Code2 className="w-3.5 h-3.5" />Code
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="w-3.5 h-3.5" />Export
                      </Button>
                      {selectedProject.status !== "deployed" && (
                        <Button size="sm" className="gap-1.5">
                          <Globe className="w-3.5 h-3.5" />Deploy
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Browser preview */}
                  <Card>
                    <CardContent className="p-0 overflow-hidden rounded-lg">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-3)] border-b border-[var(--color-border)]">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                        <div className="flex-1 px-2.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] text-[var(--color-muted-foreground)] font-mono truncate">
                          {selectedProject.url ? `https://${selectedProject.url}` : "local preview"}
                        </div>
                        <RefreshCw className="w-3 h-3 text-[var(--color-muted-foreground)]" />
                      </div>

                      <div className={cn(
                        "transition-all duration-300",
                        viewport === "desktop" ? "w-full" : viewport === "tablet" ? "max-w-[768px] mx-auto" : "max-w-[375px] mx-auto"
                      )}>
                        {selectedProject.status === "building" ? (
                          <div className="aspect-[16/10] flex flex-col items-center justify-center gap-4 bg-[var(--color-surface-1)]">
                            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                            <div className="text-center">
                              <div className="text-sm text-[var(--color-foreground)] font-medium">Building your website...</div>
                              <div className="text-xs text-[var(--color-muted-foreground)] mt-1">{selectedProject.progress}% complete</div>
                            </div>
                            <Progress value={selectedProject.progress} className="w-48" />
                          </div>
                        ) : (
                          /* Simulated website preview */
                          <div className="bg-[#09090b] text-white p-0 overflow-hidden" style={{ minHeight: "320px" }}>
                            {/* Simulated hero section */}
                            <div className="relative px-8 py-12 text-center" style={{ background: "linear-gradient(135deg, #09090b 0%, #1a1a2e 100%)" }}>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] text-indigo-400 mb-4">
                                <Sparkles className="w-2.5 h-2.5" />
                                AI-Powered Platform
                              </div>
                              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent mb-3">
                                {selectedProject.name.split(" — ")[1] || selectedProject.name}
                              </h1>
                              <p className="text-[11px] text-gray-400 max-w-xs mx-auto mb-5">
                                Automate your entire business with AI agents, workflows, and intelligent CRM.
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <div className="px-4 py-1.5 rounded-lg bg-indigo-500 text-[11px] font-semibold">Get Started</div>
                                <div className="px-4 py-1.5 rounded-lg border border-white/20 text-[11px]">View Demo</div>
                              </div>
                            </div>
                            {/* Simulated feature grid */}
                            <div className="px-6 py-4 grid grid-cols-3 gap-3">
                              {["AI Agents", "Workflows", "CRM"].map((feat) => (
                                <div key={feat} className="p-3 rounded border border-white/10 bg-white/5 text-center">
                                  <div className="text-[11px] font-semibold text-white">{feat}</div>
                                  <div className="text-[9px] text-gray-500 mt-1">Fully automated</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Page list */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Pages</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-[var(--color-border)]">
                      {["/", "/features", "/pricing", "/about", "/contact", "/blog", "/docs", "/login"].slice(0, selectedProject.pages).map((page) => (
                        <div key={page} className="flex items-center justify-between py-2.5">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-indigo-400">{page}</code>
                            {page === "/" && <Badge variant="primary">Home</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="icon-sm"><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon-sm"><Code2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
