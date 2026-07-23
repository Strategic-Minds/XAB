export type TemplateCategory =
  | "Starter"
  | "AI"
  | "SaaS"
  | "Ecommerce"
  | "Blog"
  | "Portfolio"
  | "Marketing"
  | "Authentication"
  | "Realtime"
  | "Documentation"
  | "Monorepo"
  | "Multi-Tenant";

export interface VercelTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  repoUrl: string;
  deployUrl: string;
  demoUrl?: string;
  previewImage: string;
  stack: string[];
  features: string[];
  systemPromptContext: string;
}

export const VERCEL_TEMPLATES: VercelTemplate[] = [
  // ── STARTERS ──────────────────────────────────────────────────────────────
  {
    id: "nextjs-boilerplate",
    name: "Next.js Boilerplate",
    description: "Get started with Next.js and React in seconds. The official Vercel starter.",
    category: "Starter",
    tags: ["Next.js", "App Router", "TypeScript"],
    repoUrl: "https://github.com/vercel/vercel/tree/main/examples/nextjs",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/nextjs",
    demoUrl: "https://nextjs-template.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "React 19", "TypeScript", "CSS Modules"],
    features: ["App Router", "Server Components", "API Routes", "Fast Refresh"],
    systemPromptContext: `Template: Next.js Boilerplate (official Vercel starter).
Structure: app/page.tsx as root, app/layout.tsx with metadata, app/api/ for routes.
Uses Next.js App Router with React Server Components by default.
CSS Modules for styling (no Tailwind — use inline styles or CSS Modules unless asked otherwise).
TypeScript strict mode. No database or auth by default.`,
  },
  {
    id: "nextjs-app-router",
    name: "Next.js App Router Starter",
    description: "Full App Router starter with Server Components, streaming, and TypeScript.",
    category: "Starter",
    tags: ["App Router", "Server Components", "Streaming"],
    repoUrl: "https://github.com/vercel/next.js/tree/canary/examples/app-dir-mdx",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"],
    features: ["App Router", "Server Components", "Streaming", "Suspense boundaries"],
    systemPromptContext: `Template: Next.js App Router Starter with Tailwind CSS.
Structure: app/ directory with nested layouts, loading.tsx, error.tsx, not-found.tsx per segment.
Uses React Server Components by default; add "use client" only for interactive components.
Tailwind CSS for all styling. TypeScript strict. Parallel routes and intercepting routes supported.`,
  },

  // ── AI ─────────────────────────────────────────────────────────────────────
  {
    id: "ai-chatbot",
    name: "AI Chatbot",
    description: "A full-featured, hackable Next.js AI chatbot built by Vercel with the AI SDK.",
    category: "AI",
    tags: ["AI SDK", "Streaming", "Next.js", "Neon", "Auth.js"],
    repoUrl: "https://github.com/vercel/chatbot",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/chatbot&from=templates",
    demoUrl: "https://chatbot.ai-sdk.dev/demo",
    previewImage: "https://images.ctfassets.net/e5382hct74si/4cmiDM859wtut7XeG0iFYq/953f071e4556b8a07bcab042f3a08db3/Untitled_design__17_.png",
    stack: ["Next.js 16", "AI SDK v7", "Neon Postgres", "Vercel Blob", "Auth.js", "Tailwind CSS", "shadcn/ui"],
    features: ["Multi-model support via AI Gateway", "Chat history persistence", "File attachments", "Auth", "Tool calling", "Streaming"],
    systemPromptContext: `Template: Vercel AI Chatbot (official).
Key files: app/(chat)/page.tsx (chat UI), app/api/chat/route.ts (AI endpoint), lib/ai/models.ts (model config).
Uses AI SDK v7 with useChat hook and DefaultChatTransport. streamText() in API route.
shadcn/ui components throughout. Auth.js for authentication. Neon Postgres for chat history.
Chat messages stored in DB. Multi-turn conversation with model switching.`,
  },
  {
    id: "nextjs-ai-starter",
    name: "Next.js AI Starter",
    description: "Minimal AI SDK starter with streaming text generation and the AI Gateway.",
    category: "AI",
    tags: ["AI SDK", "AI Gateway", "Streaming"],
    repoUrl: "https://github.com/vercel/ai/tree/main/examples/next-openai",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai/tree/main/examples/next-openai",
    previewImage: "https://images.ctfassets.net/e5382hct74si/4cmiDM859wtut7XeG0iFYq/953f071e4556b8a07bcab042f3a08db3/Untitled_design__17_.png",
    stack: ["Next.js 16", "AI SDK v7", "AI Gateway", "TypeScript"],
    features: ["streamText", "useChat hook", "AI Gateway models", "Streaming responses"],
    systemPromptContext: `Template: Next.js AI Starter (minimal AI SDK v7 example).
API route: app/api/chat/route.ts with streamText() returning createUIMessageStreamResponse().
Client: useChat() hook with DefaultChatTransport pointing to /api/chat.
No database, no auth. Single-file simplicity. AI Gateway for model access.`,
  },
  {
    id: "morphic",
    name: "Morphic (AI Search)",
    description: "An AI-powered search engine with a generative UI, built with the AI SDK.",
    category: "AI",
    tags: ["AI Search", "Generative UI", "Tool Calling"],
    repoUrl: "https://github.com/miurla/morphic",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/miurla/morphic&from=templates",
    demoUrl: "https://www.morphic.sh/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/4cmiDM859wtut7XeG0iFYq/953f071e4556b8a07bcab042f3a08db3/Untitled_design__17_.png",
    stack: ["Next.js 16", "AI SDK", "Tool Calling", "Vercel Blob", "Redis"],
    features: ["Web search tool", "Generative UI", "Streaming", "Search history", "Share links"],
    systemPromptContext: `Template: Morphic AI Search Engine.
Architecture: Next.js App Router + AI SDK tool calling for web search.
Key pattern: streamText() with tools array, each tool has a generate() that yields React components (generative UI).
Upstash Redis for caching search results. Chat-style interface for follow-up questions.`,
  },

  // ── SAAS ───────────────────────────────────────────────────────────────────
  {
    id: "saas-starter",
    name: "Next.js SaaS Starter",
    description: "Production-ready SaaS starter with auth, billing, dashboard, and team management.",
    category: "SaaS",
    tags: ["Auth", "Stripe", "Postgres", "Dashboard"],
    repoUrl: "https://github.com/leerob/next-saas-starter",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/leerob/next-saas-starter&from=templates",
    demoUrl: "https://next-saas-starter.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Postgres", "Drizzle ORM", "Stripe", "Auth.js", "Tailwind CSS"],
    features: ["Subscriptions", "Team management", "Role-based access", "Dashboard", "Billing portal"],
    systemPromptContext: `Template: Next.js SaaS Starter by Lee Robinson.
Structure: app/(dashboard) for authenticated pages, app/(marketing) for public pages.
Auth via Auth.js with credentials + magic links. Stripe for billing (subscriptions).
Drizzle ORM + Postgres for data. Middleware-based auth protection.
Key pages: dashboard, settings, billing, team, sign-in, sign-up.`,
  },
  {
    id: "nextjs-subscription",
    name: "Subscription Payments Starter",
    description: "Full-stack SaaS subscription starter with Stripe, Supabase, and Next.js.",
    category: "SaaS",
    tags: ["Stripe", "Supabase", "Subscriptions"],
    repoUrl: "https://github.com/vercel/nextjs-subscription-payments",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/nextjs-subscription-payments&from=templates",
    demoUrl: "https://subscription-payments.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Supabase", "Stripe", "TypeScript", "Tailwind CSS"],
    features: ["Stripe Checkout", "Customer portal", "Supabase Auth", "Row Level Security", "Webhooks"],
    systemPromptContext: `Template: Next.js Subscription Payments (Vercel official).
Key files: app/api/webhooks/route.ts for Stripe webhooks, utils/stripe.ts for Stripe helpers.
Supabase for auth + database with RLS. Stripe products/prices synced to DB via webhooks.
Pricing page shows plans from Stripe. Customer portal for self-serve billing management.`,
  },

  // ── ECOMMERCE ──────────────────────────────────────────────────────────────
  {
    id: "nextjs-commerce",
    name: "Next.js Commerce",
    description: "High-performance e-commerce starter kit with Shopify and Next.js.",
    category: "Ecommerce",
    tags: ["Shopify", "Commerce", "App Router"],
    repoUrl: "https://github.com/vercel/commerce",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/commerce&from=templates",
    demoUrl: "https://nextjs-commerce.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1RzhtOHEvW7xyn9qAsdr5E/85331c32482b7d022585c39ddb3ae9f2/CleanShot_2023-07-24_at_21.37.15_2x.png",
    stack: ["Next.js 16", "Shopify Storefront API", "Tailwind CSS", "TypeScript"],
    features: ["Product catalog", "Cart (with cookies)", "Search", "Collections", "Checkout via Shopify"],
    systemPromptContext: `Template: Next.js Commerce with Shopify Storefront API.
Fetches products, collections, and cart data from Shopify Storefront GraphQL API.
No CMS — all content comes from Shopify. Cart state in cookies via Server Actions.
Key patterns: lib/shopify/index.ts for API calls, components/cart/ for cart UI, app/(store) for pages.
ISR on product and collection pages. TypeScript-strict Shopify types.`,
  },
  {
    id: "commerce-medusa",
    name: "Medusa Commerce Starter",
    description: "Open-source headless commerce with Medusa.js backend and Next.js storefront.",
    category: "Ecommerce",
    tags: ["Medusa", "Headless", "Open Source"],
    repoUrl: "https://github.com/medusajs/nextjs-starter-medusa",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/medusajs/nextjs-starter-medusa&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1RzhtOHEvW7xyn9qAsdr5E/85331c32482b7d022585c39ddb3ae9f2/CleanShot_2023-07-24_at_21.37.15_2x.png",
    stack: ["Next.js 16", "Medusa.js", "Tailwind CSS", "TypeScript"],
    features: ["Product listing", "Cart", "Checkout", "Order history", "Customer auth"],
    systemPromptContext: `Template: Medusa.js Headless Commerce with Next.js storefront.
Backend: Separate Medusa.js server. Frontend: Next.js storefront calling Medusa REST API.
Key lib: lib/data/ with fetch helpers for products, cart, orders. App Router with dynamic routes.
Cart stored in Medusa session. Customer auth via Medusa. Tailwind CSS styling.`,
  },

  // ── BLOG ───────────────────────────────────────────────────────────────────
  {
    id: "blog-starter",
    name: "Blog Starter Kit",
    description: "A statically generated blog built with Next.js, Markdown, and a minimal CMS.",
    category: "Blog",
    tags: ["Markdown", "Static", "Blog", "MDX"],
    repoUrl: "https://github.com/vercel/next.js/tree/canary/examples/blog-starter",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/blog-starter&from=templates",
    demoUrl: "https://next-blog-starter.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/9HIawEMUBUpmhHTcnFscc/4d16c261512ad87d6cc5fefb32510381/CleanShot_2022-03-09_at_19.30.51.png",
    stack: ["Next.js 16", "Markdown", "TypeScript", "Tailwind CSS"],
    features: ["Static generation", "Markdown posts", "Author profiles", "SEO meta", "RSS feed"],
    systemPromptContext: `Template: Next.js Blog Starter Kit (Markdown-based, statically generated).
Posts stored as .md files in _posts/ directory. Gray-matter for frontmatter parsing.
generateStaticParams() for all post slugs. Dynamic OG image generation.
lib/api.ts reads markdown files at build time. app/posts/[slug]/page.tsx renders posts.`,
  },
  {
    id: "nextjs-contentful-blog",
    name: "Next.js + Contentful Blog",
    description: "Headless CMS blog with Contentful and Next.js with ISR and preview mode.",
    category: "Blog",
    tags: ["Contentful", "CMS", "ISR", "Preview Mode"],
    repoUrl: "https://github.com/vercel/next.js/tree/canary/examples/cms-contentful",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/cms-contentful&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/9HIawEMUBUpmhHTcnFscc/4d16c261512ad87d6cc5fefb32510381/CleanShot_2022-03-09_at_19.30.51.png",
    stack: ["Next.js 16", "Contentful", "TypeScript", "Tailwind CSS"],
    features: ["ISR revalidation", "Draft/preview mode", "Rich text rendering", "SEO"],
    systemPromptContext: `Template: Next.js + Contentful CMS Blog.
lib/contentful/ with typed GraphQL queries to Contentful Delivery and Preview APIs.
ISR via revalidate tag on fetch. Draft mode toggled via app/api/draft-mode/ route.
ContentfulImage component uses next/image with Contentful image URLs. App Router.`,
  },
  {
    id: "nextra-docs",
    name: "Nextra Docs Starter",
    description: "Powerful Markdown-powered docs site built with Nextra and Next.js.",
    category: "Documentation",
    tags: ["Nextra", "MDX", "Docs", "Search"],
    repoUrl: "https://github.com/shuding/nextra",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/shuding/nextra-docs-template&from=templates",
    demoUrl: "https://nextra.site/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/5RZetTd7rd1mQtoZt2fajA/747eabb89b6378ecfc0ef433f5e47a01/CleanShot_2022-12-02_at_12.07.44.png",
    stack: ["Next.js 16", "Nextra", "MDX", "TypeScript"],
    features: ["Full-text search", "Auto sidebar", "Dark mode", "Code highlighting", "i18n"],
    systemPromptContext: `Template: Nextra Documentation Site.
MDX files in pages/ (or content/) directory auto-generate sidebar and nav.
theme.config.tsx controls site-wide settings (logo, footer, nav links).
Built-in Pagefind or FlexSearch for client-side full-text search.
Syntax highlighting via Shiki. Custom MDX components via components/ directory.`,
  },

  // ── PORTFOLIO ──────────────────────────────────────────────────────────────
  {
    id: "portfolio-starter",
    name: "Portfolio Starter",
    description: "Clean, minimal developer portfolio with a blog, powered by Markdown and Next.js.",
    category: "Portfolio",
    tags: ["Portfolio", "Blog", "MDX", "Minimal"],
    repoUrl: "https://github.com/vercel/examples/tree/main/solutions/blog",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/solutions/blog&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/9HIawEMUBUpmhHTcnFscc/4d16c261512ad87d6cc5fefb32510381/CleanShot_2022-03-09_at_19.30.51.png",
    stack: ["Next.js 16", "MDX", "TypeScript", "Tailwind CSS"],
    features: ["Blog posts", "Work section", "About page", "RSS", "OG images"],
    systemPromptContext: `Template: Developer Portfolio with MDX Blog.
MDX-based blog in app/blog/[slug]/ with gray-matter frontmatter.
Sections: Home, About, Work, Blog. Clean typographic design.
Dynamic OG image generation via app/og/route.tsx. RSS via app/feed.xml/route.ts.`,
  },

  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    id: "landing-page",
    name: "SaaS Landing Page",
    description: "Modern SaaS marketing landing page with hero, features, pricing, and CTA sections.",
    category: "Marketing",
    tags: ["Landing Page", "Marketing", "Tailwind"],
    repoUrl: "https://github.com/vercel/examples/tree/main/solutions/saas-landing",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/solutions/saas-landing&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Tailwind CSS", "TypeScript"],
    features: ["Hero section", "Feature grid", "Pricing table", "Testimonials", "CTA", "Footer"],
    systemPromptContext: `Template: SaaS Marketing Landing Page.
Single-page layout with sections: Hero, Features (grid), Social proof, Pricing tiers, FAQ, CTA, Footer.
Tailwind CSS + shadcn/ui components. Framer Motion for entrance animations.
No backend — purely static marketing page. Focus on conversion optimization.`,
  },

  // ── AUTHENTICATION ─────────────────────────────────────────────────────────
  {
    id: "clerk-auth",
    name: "Next.js + Clerk Auth",
    description: "Drop-in authentication with Clerk: sign-in, sign-up, user profile, and middleware.",
    category: "Authentication",
    tags: ["Clerk", "Auth", "Middleware"],
    repoUrl: "https://github.com/clerk/clerk-nextjs-app-router-quickstart",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/clerk/clerk-nextjs-app-router-quickstart&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Clerk", "TypeScript", "Tailwind CSS"],
    features: ["Email/password", "OAuth (Google, GitHub)", "User profile", "Protected routes", "Middleware"],
    systemPromptContext: `Template: Next.js with Clerk Authentication.
middleware.ts uses clerkMiddleware() with createRouteMatcher for protected routes.
Server components: auth() from @clerk/nextjs/server to get userId, sessionClaims.
Client components: useUser(), useAuth(), <UserButton />, <SignInButton /> from @clerk/nextjs.
Protected pages in app/(protected)/ group. Public pages in app/(public)/.`,
  },
  {
    id: "nextauth-starter",
    name: "NextAuth.js Starter",
    description: "Auth.js (NextAuth v5) with multiple providers, sessions, and protected routes.",
    category: "Authentication",
    tags: ["Auth.js", "NextAuth", "OAuth", "Sessions"],
    repoUrl: "https://github.com/nextauthjs/next-auth-example",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/nextauthjs/next-auth-example&from=templates",
    demoUrl: "https://next-auth-example.vercel.app/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Auth.js v5", "TypeScript", "Prisma", "Postgres"],
    features: ["Email/password", "GitHub OAuth", "Google OAuth", "Session management", "JWT or DB sessions"],
    systemPromptContext: `Template: Auth.js (NextAuth v5) Starter.
auth.ts at project root configures providers and callbacks.
Middleware in middleware.ts using auth() from auth.ts.
Server: auth() to get session. Client: useSession() from next-auth/react.
Prisma adapter for DB sessions. Protected routes via matcher in middleware config.`,
  },

  // ── REALTIME ───────────────────────────────────────────────────────────────
  {
    id: "realtime-cursor",
    name: "Realtime Cursor with Liveblocks",
    description: "Multiplayer cursor presence app with Liveblocks and Next.js.",
    category: "Realtime",
    tags: ["Liveblocks", "Presence", "WebSockets", "Multiplayer"],
    repoUrl: "https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Liveblocks", "TypeScript", "Tailwind CSS"],
    features: ["Live cursors", "Presence awareness", "Real-time sync", "Room API"],
    systemPromptContext: `Template: Realtime Cursors with Liveblocks.
useMyPresence() to broadcast cursor position. useOthers() to render other cursors.
RoomProvider wraps the app in app/layout.tsx. Liveblocks API key in .env.
Custom Cursor component renders per-user colored cursors with name labels.`,
  },
  {
    id: "realtime-chat",
    name: "Realtime Chat (Ably + Next.js)",
    description: "Live chat room app built with Ably realtime messaging and Next.js.",
    category: "Realtime",
    tags: ["Ably", "WebSockets", "Chat", "Presence"],
    repoUrl: "https://github.com/ably-labs/nextjs-chat-app",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/ably-labs/nextjs-chat-app&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Ably", "TypeScript", "Tailwind CSS"],
    features: ["Live messages", "Presence channel", "Message history", "Typing indicators"],
    systemPromptContext: `Template: Realtime Chat with Ably.
app/api/token/route.ts issues Ably token requests for client-side auth.
useChannel() hook subscribes to chat channel. usePresence() for online users.
Messages streamed in real time. No DB — messages ephemeral via Ably history.`,
  },

  // ── MULTI-TENANT ───────────────────────────────────────────────────────────
  {
    id: "platforms-starter",
    name: "Platforms Starter Kit",
    description: "Multi-tenant SaaS platform with custom domains, subdomains, and per-tenant content.",
    category: "Multi-Tenant",
    tags: ["Multi-tenant", "Subdomains", "Custom Domains", "Edge Middleware"],
    repoUrl: "https://github.com/vercel/platforms",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/platforms&from=templates",
    demoUrl: "https://demo.vercel.pub/",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Next.js 16", "Prisma", "Postgres", "Edge Middleware", "Vercel Domains", "Tailwind CSS"],
    features: ["Custom domains", "Subdomain routing", "Per-tenant CMS", "Admin dashboard", "Wildcard SSL"],
    systemPromptContext: `Template: Vercel Platforms Starter Kit (multi-tenant).
middleware.ts rewrites requests based on hostname to route subdomains and custom domains.
app/[domain]/ handles tenant-specific pages. app/app/(dashboard)/ for tenant admin.
Prisma + Postgres stores sites, posts, and users per tenant. Vercel Domains API for custom domains.
Key pattern: headers().get('host') to identify tenant in Server Components.`,
  },

  // ── MONOREPO ───────────────────────────────────────────────────────────────
  {
    id: "turborepo-starter",
    name: "Turborepo + Next.js Monorepo",
    description: "Turborepo starter with a Next.js web app, shared UI package, and shared config.",
    category: "Monorepo",
    tags: ["Turborepo", "Monorepo", "Shared Packages"],
    repoUrl: "https://github.com/vercel/turborepo/tree/main/examples/basic",
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/turborepo/tree/main/examples/basic&from=templates",
    previewImage: "https://images.ctfassets.net/e5382hct74si/1aHobcZ8H6WY48u5CMXlOe/13f7ae605e457bb132a12cf7db323f43/nextjs-template_1.png",
    stack: ["Turborepo", "Next.js 16", "TypeScript", "pnpm workspaces", "Tailwind CSS"],
    features: ["Shared UI package", "Shared eslint/ts configs", "Remote caching", "Parallel builds"],
    systemPromptContext: `Template: Turborepo Monorepo Starter.
Structure: apps/web (Next.js), packages/ui (shared React components), packages/eslint-config, packages/typescript-config.
pnpm workspaces. turbo.json defines build pipeline with caching.
Shared components exported from packages/ui/src/index.tsx. Import as @repo/ui in apps.`,
  },
];

// Helper: get all unique categories
export const TEMPLATE_CATEGORIES = [
  "All",
  ...Array.from(new Set(VERCEL_TEMPLATES.map(t => t.category))),
] as const;

// Helper: find template by id
export function getTemplateById(id: string): VercelTemplate | undefined {
  return VERCEL_TEMPLATES.find(t => t.id === id);
}

// Helper: filter by category
export function getTemplatesByCategory(category: string): VercelTemplate[] {
  if (category === "All") return VERCEL_TEMPLATES;
  return VERCEL_TEMPLATES.filter(t => t.category === category);
}
