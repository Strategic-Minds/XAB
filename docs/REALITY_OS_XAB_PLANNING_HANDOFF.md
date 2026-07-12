# REALITY OS — XAB PLANNING HANDOFF
## PLAN + DISCOVERY + ARCHITECTURE
**Date:** 2026-07-12 | **Status:** PLANNING ONLY — NO PROTECTED ACTIONS TAKEN  
**Produced by:** Strategic Minds AUTO BUILDER OS Level 5 Autonomous Orchestrator  
**Target repo:** Strategic-Minds/XAB (Xtreme Auto Builder)

---

## PHASE / STEP
**PHASE:** PLAN + DISCOVERY + ARCHITECTURE  
**STEP:** Current-State Audit → Ceiling Matrix → Architecture → Phased Plan → Dependency Graph → Validation Plan → Risk Register → Workbook Gap Report

---

## LAST KNOWN STATE

| Layer | Current Reality |
|---|---|
| XAB repo | Created 2026-07-12. Empty (README only, size=0). No code, no migrations, no secrets. |
| Controlling workbook | REALITY_OS_BASE44_MCP_MASTER_HANDOFF.xlsx — referenced but NOT yet pushed to any system. |
| AUTO_BUILDER-V1 | Canonical production repo. ~184+ API routes, 30+ cron handlers, live on Vercel at autobuilderos.com. Last commit 2026-07-12T04:36 (GPT bridge active). MCP surface: 10+ server implementations, openapi.yaml with 9 paths. |
| AUTOBUILDER-V2 | UI/frontend donor. Rich adaptive frontend (30+ pages/routes), 8 engine services, Supabase SSR, Radix/Tailwind component system. Not serving production traffic. |
| auto-builder-os | Lightweight version of V2 frontend. Treated as supplementary donor. |
| Base44 app | ID 6a4ae522852a5e08bfa42450 "AUTO BUILDER ORCHESTRATOR" — entities/schemas partially inspected, workbook not yet pushed. |
| Supabase | Production instance with 15 control-plane tables live. 388 legacy tables. |

---

## SOURCE TRUTH (per document)

Priority order per the planning handoff:
1. Jeremy's explicit instruction in session
2. Active governance lock (Level 5)
3. REALITY_OS_BASE44_MCP_MASTER_HANDOFF.xlsx (controlling spec, treat as imperfect)
4. Strategic-Minds/AUTOBUILDER-V2 (preferred frontend + control-plane donor)
5. Strategic-Minds/AUTO_BUILDER-V1 (selective donor: MCP, workbooks, connectors, validation, governance, browser, receipts, automation)
6. Strategic-Minds/auto-builder-os (supplementary)
7. Base44 app ID 6a4ae522852a5e08bfa42450

---

## CURRENT ARCHITECTURE — HONEST ASSESSMENT

### What Actually Exists and Works

**AUTO_BUILDER-V1 (mature production system)**
- ✅ 4 live cron routes: `/api/cron/auto-builder` (*/5min), `/api/cron/enterprise-kernel` (*/5min), `/api/cron/quality-auto-heal` (*/15min), `/api/cron/intelligence-ingest` (hourly)
- ✅ CRON_SECRET auth present on cron routes (confirmed PR #73)
- ✅ MCP server implementations: auto-builder-mcp-pulse, mcp-health-check, mcp-self-operating-loop, mcp-tool-runner, mcp-deadletter-retry, mcp-receipt-sync, mcp-universe, mcp-extended, mcp-minimal, mcp-supabase (10+ server dirs)
- ✅ OpenAPI surface: 9 paths published at `auto-builder-strategic-minds-advisory.vercel.app`
- ✅ 15 Supabase control-plane tables live
- ✅ Full governance stack: AUTONOMY_AND_APPROVAL_MATRIX.md, AGENTS.md, ARCHITECTURE.md
- ✅ Validation scripts: validate-factory.mjs, validate-mcp-tools.mjs, validate-autonomous-control-plane.mjs, validate-epoxy-discover-engine.mjs
- ✅ gpt-swarm-services: 8 engines (approval, hardening, notification, queue, registry, repair, scoring, validation)
- ⚠️ MCP servers: implementations exist but OAuth 2.1-compliant remote gateway with protected-resource metadata is NOT confirmed
- ⚠️ Cron handlers: ~30 route directories declared but some are stubs (confirmed HQ finding from prior audits)
- ❌ RAG pipeline: 26 rag_chunks rows, 0 rag_embeddings — no semantic search
- ❌ Financial forecasting: no ML models, no financial data provider connected
- ❌ Web scraping system: not operational (intelligence-ingest cron exists, scope unknown)
- ❌ WCAG 2.2 AA accessibility: not tested, not validated
- ❌ PWA / offline / voice: not confirmed
- ❌ Visual regression testing: not set up

**AUTOBUILDER-V2 (frontend donor)**
- ✅ Rich adaptive frontend: 30+ pages (dashboard, agents, build-queue, command-center, mission-control, receipts, validation, governance, etc.)
- ✅ AI SDK integration (@ai-sdk/openai, @ai-sdk/react)
- ✅ Radix UI full component library
- ✅ Supabase SSR (@supabase/ssr)
- ✅ Playwright E2E configured
- ✅ Scorecard script exists
- ⚠️ No confirmed WCAG testing
- ⚠️ No confirmed design token system (Tailwind config is minimal)
- ❌ No financial forecasting routes/components
- ❌ No scraping system routes/components

**XAB (target)**
- ❌ Empty. Only README. No code, migrations, secrets, or routes.

---

## CEILING CATEGORY MATRIX

Scoring: Current = honest assessment. Target = REALITY OS ceiling per document definition.

| # | Category | Current Score | Target | Benchmark Leaders | Key Gaps | Acceptance Criteria | Test Method | Evidence Required | Cost | Risk |
|---|---|---|---|---|---|---|---|---|---|---|
| **FRONTEND** | | | | | | | | | | |
| 1 | Adaptive Generative UI | 20 | 100 | Vercel v0, Retool, Plasmic | No schema-driven component selection, no saved layouts, no explainable decisions, no safe boundaries | Intent → interface generation; role-aware; fallback deterministic; approval embedded | Schema validation + E2E | Component-render test suite + audit log | HIGH | HIGH |
| 2 | Enterprise Visual System | 30 | 100 | shadcn/ui, Tailwind UI, Radix | No design token file, no motion language, no visual regression baseline | Token-driven; dark/light; responsive; WCAG-contrast verified | Visual regression (Percy/Chromatic) | Baseline screenshots + contrast ratios | MED | MED |
| 3 | User Experience | 25 | 100 | Linear, Notion, Vercel Dashboard | No command palette confirmed, no workspace memory, no undo/rollback in UI | Command palette functional; recent activity logged; undo works | UX test suite + Playwright | Task-completion tests | MED | MED |
| 4 | Accessibility | 10 | 100 | GOV.UK Design System, Radix | Zero WCAG 2.2 AA testing done | Full WCAG 2.2 AA across all user journeys | axe-core + manual keyboard test | axe report + screen reader transcript | MED | MED |
| 5 | Performance | 15 | 100 | Vercel, Cloudflare, Astro | No performance budgets defined, no Core Web Vitals tracking | LCP <2.5s, FID <100ms, CLS <0.1, bundle <150KB gzipped | Lighthouse CI + WebPageTest | CI pipeline report + Lighthouse score | LOW | LOW |
| 6 | Mobile / PWA / Voice | 10 | 100 | PWABuilder, Capacitor | No manifest.ts → full PWA confirmed, no offline mode, no voice | Installable PWA; offline read; background sync; voice input | Lighthouse PWA audit + mobile device test | Lighthouse PWA score 100 | MED | MED |
| 7 | Data Visualization | 20 | 100 | Tremor, Recharts, D3, Observable | No financial charts, no forecast intervals, no geographic views | Real-time dashboards; forecast CI bands; drill-down | E2E visual tests | Storybook + E2E | MED | MED |
| 8 | Frontend Reliability | 30 | 100 | NextJS error boundaries, Sentry | No confirmed error boundaries, no feature flags, no skeleton states | Error boundary on every page; skeleton states; retry UI | Chaos test (force network fail) | Error boundary test + Sentry receipt | LOW | MED |
| **BACKEND** | | | | | | | | | | |
| 9 | API Architecture | 50 | 100 | tRPC, Zod, Hono | No versioned contracts, no idempotency keys confirmed, no dead-letter queue API surface | Typed, versioned, idempotent, rate-limited, with DLQ | Contract tests + load test | OpenAPI spec + test results | MED | MED |
| 10 | Remote MCP Gateway | 40 | 100 | Anthropic MCP spec, Auth0 | OAuth 2.1 per MCP spec not confirmed; no protected-resource metadata; no capability negotiation; no step-up approval | Full MCP authorization spec compliance; separate client identities; tool versioning; kill switch | MCP protocol tests | Protocol compliance test + audit log | HIGH | HIGH |
| 11 | Base44 Integration Packs | 0 | 100 | Custom OpenAPI integrations | No packs created; workbook not pushed; no operations registered | 6 packs created (Control, Intelligence, Finance, Build, Validation, Admin); ≤30 ops each | Integration smoke tests | Base44 connector test receipt | MED | MED |
| 12 | Agent Architecture | 35 | 100 | LangGraph, AutoGen, CrewAI | Agent manifests exist but no formal evaluation cases, no tool-permission boundaries enforced in code | Formal agent spec for all 20 agents; sandboxed tool permissions; escalation paths | Agent eval suite | Eval scorecard per agent | HIGH | HIGH |
| 13 | Memory / RAG | 10 | 100 | Pinecone, pgvector, LlamaIndex | RAG: 26 chunks, 0 embeddings — fully non-functional; no memory-layer separation | 7 memory layers; verified/inferred/expired distinction; semantic search functional | RAG retrieval accuracy test | Recall@10 metric + latency receipt | HIGH | HIGH |
| 14 | Security | 55 | 100 | OWASP Top 10, NIST, SSRF guides | No SSRF protection confirmed; no prompt-injection defense documented; no kill switch; no spending limits in code | Full OWASP compliance; SSRF blocked; kill switch; rate limits; audit log | Security test suite + pen-test script | CVE-free npm audit + OWASP test results | HIGH | CRITICAL |
| 15 | Observability | 40 | 100 | Datadog, Axiom, OpenTelemetry | No distributed traces; no cost telemetry; no model telemetry; no SLOs defined | Logs + metrics + traces + cost + model telemetry; SLO dashboard | Trace sampling test | OTLP export test + SLO receipt | MED | MED |
| 16 | Testing & Validation | 45 | 100 | Vitest, Playwright, axe-core | No unit tests confirmed; no contract tests; no prompt-injection tests; no disaster-recovery sim | Full suite: lint, types, unit, integration, contract, DB policy, workflow, MCP, agent eval, security, a11y, perf, E2E, visual, mobile, rollback | CI pass gate | Green CI receipt on all suites | HIGH | HIGH |
| **INTELLIGENCE** | | | | | | | | | | |
| 17 | Financial Forecasting | 0 | 100 | Bloomberg, FactSet, Prophet, XGBoost | No model exists; no data provider; no governance; no champion/challenger | Point-in-time data; walk-forward test; quantile forecasts; model cards; drift detection; Fed model-risk alignment | Champion/challenger eval | Model card + walk-forward results + validation receipt | VERY HIGH | CRITICAL |
| 18 | Scraping / Intelligence | 15 | 100 | Apify, Playwright, RFC 9309 | No robots-policy preflight; no source registry; no domain kill switch; no SSRF defense | Full RFC 9309 robots compliance; domain registry; rate limits; kill switch; provenance hashes | Scraper compliance test | robots.txt test receipt + rate-limit log | HIGH | HIGH |

---

## ARCHITECTURE PLAN

### Frontend Architecture (XAB)
```
app/
  (marketing)/          # Public-facing pages
  (dashboard)/          # Auth-gated operator console
    command-center/     # Universal search + command palette
    projects/           # Project lifecycle kanban
    agents/             # Agent activity + evaluation dashboard
    build-queue/        # Job queue with real-time status
    financial/          # Forecasting + financial intelligence
    intelligence/       # Scraping + research ingestion
    receipts/           # Immutable audit trail
    governance/         # Approval queue + decision log
    system-health/      # Observability dashboard
    settings/           # Config + secrets (view-only, no direct edit)
  api/                  # Route handlers (backend)

components/
  ui/                   # Design-token-driven primitives (Radix + shadcn)
  charts/               # Data viz (recharts + d3)
  adaptive/             # Generative UI components
  layouts/              # Role-aware layout shells
  
lib/
  tokens/               # Design tokens (CSS variables + Tailwind config)
  validation/           # Zod schemas for all API contracts
  auth/                 # Supabase SSR auth utilities
  memory/               # Client-side workspace memory hooks
```

**Key decisions:**
- Framework: Next.js 15 (App Router) — already proven in V1/V2
- UI: Radix UI primitives + Tailwind CSS + design tokens — donor from V2
- State: React Query / SWR for server state; zustand for UI state
- AI: @ai-sdk/openai for generative UI + voice
- Design tokens: CSS custom properties mapped to Tailwind config (not hardcoded colors)
- Visual regression: Playwright screenshots (Percy/Chromatic as stretch target)
- a11y: axe-core in CI on every PR

### Backend Architecture (XAB)
```
app/api/
  v1/                   # Versioned API surface
    health/             # System health
    projects/           # Project CRUD + lifecycle transitions
    agents/             # Agent registry + invocation
    queue/              # Job queue management
    receipts/           # Immutable receipt append
    governance/         # Approval gate
    financial/          # Forecast endpoints
    intelligence/       # Scraper control + ingestion
    mcp/                # MCP gateway (remote, OAuth 2.1)
  cron/                 # Scheduled jobs (all CRON_SECRET protected)
    heartbeat/          # 5-min system pulse
    heal/               # 15-min repair loop
    ingest/             # Hourly intelligence ingest
    financial-refresh/  # Daily model refresh
  webhooks/             # Inbound webhook handlers
```

**Key decisions:**
- All API routes: Zod schema validation + typed response contracts
- All cron routes: mandatory CRON_SECRET header check (learned from V1 hardening)
- Idempotency: X-Idempotency-Key header on all write routes
- Rate limiting: Vercel Edge rate limiting + Upstash Redis (or native Supabase RLS)
- Dead-letter: Supabase `dlq_entries` table with retry counter + last_error
- Error taxonomy: standardized error codes in openapi.yaml

### MCP Gateway Architecture (XAB)
```
app/api/mcp/
  .well-known/oauth-protected-resource/   # RFC 9728 resource metadata
  authorize/                               # OAuth 2.1 auth code flow
  token/                                   # Token endpoint
  discover/                                # Capability discovery
  tools/                                   # Tool execution endpoint
  audit/                                   # Audit log query
  kill-switch/                             # Emergency tool disable
```

**Key decisions:**
- Per MCP authorization spec: OAuth 2.1 with PKCE, protected-resource metadata
- Separate client registrations: Base44 client, GPT client — different scopes
- Scoped tools: each tool declares required scope (read, write, execute, admin)
- Step-up: protected actions trigger step-up authorization challenge
- Persistence: durable workflow IDs + job state in Supabase (not socket-dependent)
- Session expiration: tokens expire, capability rediscovery on resume
- Kill switch: per-tool + global kill switch in `mcp_tool_registry` table

### Data Architecture (XAB — Supabase)
```
Core control plane:
  projects            — project lifecycle state
  jobs                — queue entries with DLQ support
  agents              — agent registry + capabilities
  receipts            — immutable append-only audit trail
  approvals           — gated action queue
  validations         — test result records
  scores              — scorecard entries
  repair_items        — repair queue
  hardening_items     — hardening queue

Intelligence layer:
  rag_documents       — source documents
  rag_chunks          — chunked text
  rag_embeddings      — vector embeddings (pgvector)
  rag_source_refs     — provenance tracking

Scraping layer:
  scrape_sources      — source registry
  domain_policies     — robots/terms registry
  scrape_snapshots    — immutable captures
  scrape_extractions  — structured output

Financial layer:
  financial_models    — model inventory + cards
  financial_runs      — run history with inputs/outputs
  financial_validations — champion/challenger results
  forecast_snapshots  — point-in-time predictions

Observability:
  telemetry_events    — OTLP-compatible event log
  cost_events         — per-call cost tracking
  slo_records         — SLO measurement

MCP layer:
  mcp_clients         — registered client identities
  mcp_tokens          — active token store (+ expiry)
  mcp_audit_log       — immutable tool-call audit
  mcp_tool_registry   — tool catalog + kill-switch flag
```

### Agent Architecture (XAB)
20 agents as per 21_GPT_SWARM_OS manifest. Each requires formal spec:
- Purpose, Inputs, Outputs, Allowed tools, Forbidden actions, Data permissions, Approval boundaries, Evaluation cases, Failure behavior, Escalation path, Receipt requirements

Priority agents for Phase 1: Orchestrator, Validator, Registry Controller, Repair Agent, Release Manager

### Security Architecture
- Auth: Supabase Auth with MFA
- Authz: RLS on every table (no table without policy)
- SSRF: allowlist-only external requests from backend routes
- Prompt injection: input sanitization + content isolation before any LLM call
- Secrets: Vercel encrypted env vars, never logged or exposed in responses
- Spending limits: per-project token budget enforced at LLM call layer
- Kill switches: per-agent, per-tool, per-domain, and global
- Audit log: every protected action logged to `receipts` table immutably
- Dependency scanning: `npm audit` in CI, block on critical/high
- Key rotation: 90-day rotation schedule documented in runbook

### Financial Architecture
- No guaranteed returns, no autonomous trading, no unvalidated model promotion
- Data: point-in-time datasets only (no look-ahead), corporate actions handled
- Models: statistical (ARIMA/ETS) → gradient boosting → deep learning ensemble, all versioned
- Governance: champion/challenger gating; model cards required; Fed model-risk principles
- Validation: walk-forward test + purging/embargo per methodology
- Kill switch: immediate model suspension on drift detection

### Scraping Architecture
- RFC 9309 robots.txt compliance: preflight check on every domain before first request
- Source registry: every domain registered with policy + license notes
- Rate limits: per-domain (not shared global), configurable
- Provenance: content hash + capture timestamp on every snapshot
- Kill switches: per-domain + global
- Prohibited: CAPTCHA bypass, auth bypass, paywall evasion, IP rotation to evade restrictions

---

## PHASED IMPLEMENTATION PLAN

### Phase 0: Repository Scaffold (XAB bootstrap)
**Duration:** 1 session | **Gate:** Jeremy approval to push scaffold to XAB  
- Initialize Next.js 15 App Router project in XAB
- Configure TypeScript strict mode, ESLint, Prettier
- Set up Tailwind + design token foundation
- Create directory structure matching architecture above
- Set up Playwright, axe-core, Vitest
- Create `vercel.json` with CRON_SECRET-protected routes
- Create `.env.example` with all required variables documented
- Set up CI: GitHub Actions (lint + type-check + test on every PR)
- **OUTPUT:** Clean scaffold, green CI, zero secrets in repo

### Phase 1: Data + Authorization (Supabase foundation)
**Duration:** 1-2 sessions | **Gate:** Supabase migration approval  
- Write Supabase migration files for all 35 tables above
- Apply RLS policies to every table before data insert
- Create service-role vs user-role separation
- Seed: mcp_tool_registry, agent registry, domain_policies
- Validate: every table has at least one RLS policy test
- **OUTPUT:** Migration receipts + RLS policy test results

### Phase 2: MCP Gateway
**Duration:** 2 sessions | **Gate:** Review of OAuth 2.1 implementation  
- Implement protected-resource metadata endpoint
- Implement OAuth 2.1 authorization code + PKCE flow
- Register Base44 client + GPT client with separate scopes
- Implement tool discovery, capability negotiation, versioning
- Implement audit log + kill switch
- Implement step-up authorization for protected tools
- **OUTPUT:** MCP protocol compliance test results

### Phase 3: Base44 Integration Packs
**Duration:** 1 session | **Gate:** Jeremy review of OpenAPI specs before upload  
- Reality Control pack (project management operations)
- Reality Intelligence pack (RAG + memory operations)
- Reality Finance pack (forecasting operations)
- Reality Build pack (scaffold + deploy operations)
- Reality Validation pack (test + score operations)
- Reality Administration pack (governance + config)
- **OUTPUT:** 6 OpenAPI specs + Base44 connector test receipts

### Phase 4: Core Backend + API Layer
**Duration:** 2 sessions | **Gate:** Contract test suite green  
- All versioned API routes with Zod validation
- Idempotency middleware
- Rate limiting
- Dead-letter queue handler
- Error taxonomy + standardized error responses
- Health + readiness endpoints
- **OUTPUT:** OpenAPI spec + contract test receipt

### Phase 5: Agent System
**Duration:** 2-3 sessions | **Gate:** Agent eval suite green  
- 5 priority agents formally implemented (orchestrator, validator, registry, repair, release)
- Tool permission sandboxing
- Eval cases written and run
- Escalation path tested
- **OUTPUT:** Agent scorecard per agent

### Phase 6: Adaptive Frontend
**Duration:** 2-3 sessions | **Gate:** Visual regression baseline + a11y audit  
- Design token system implemented
- Command palette functional
- All 15+ dashboard pages wired to real API
- Role-aware layouts
- Error boundaries on every page
- Skeleton states + retry UI
- Dark/light themes
- WCAG 2.2 AA: axe-core zero violations
- **OUTPUT:** Lighthouse score + axe report + visual regression baseline

### Phase 7: RAG / Memory System
**Duration:** 1-2 sessions | **Gate:** Embedding provider decision by Jeremy  
- Embedding provider selection (OpenAI text-embedding-3-large or alternative)
- Chunk ingestion pipeline
- pgvector similarity search
- 7-layer memory model implemented
- Verified/inferred/expired distinction
- **OUTPUT:** Recall@10 metric test receipt

### Phase 8: Financial System
**Duration:** 3+ sessions | **Gate:** Model validation review by Jeremy  
- Data provider selection + licensing (PROTECTED ACTION — requires Jeremy)
- Point-in-time dataset pipeline
- Baseline statistical models (ARIMA/ETS)
- Walk-forward validation framework
- Model card template
- Champion/challenger governance
- Drift detection
- **OUTPUT:** Model card + walk-forward results + Fed model-risk alignment receipt

### Phase 9: Scraping / Intelligence
**Duration:** 2 sessions | **Gate:** Domain policy registry review  
- Source registry + domain policy registry
- RFC 9309 robots preflight
- HTTP-first retrieval + Playwright browser fallback
- Rate limit enforcement
- Provenance hashing
- Kill switches
- **OUTPUT:** Compliance test receipt + sample provenance record

### Phase 10: Observability
**Duration:** 1 session | **Gate:** SLO definitions approved  
- Structured logging (JSON, OTLP-compatible)
- Metrics: cost per call, model latency, workflow duration
- Distributed traces (OpenTelemetry)
- SLO dashboard
- Alert rules
- **OUTPUT:** OTLP export receipt + SLO record

### Phase 11: Security Hardening
**Duration:** 1-2 sessions | **Gate:** Security gate must score 100  
- SSRF allowlist implemented + tested
- Prompt injection tests passing
- Full npm audit clean (no critical/high)
- Spending limit enforcement tested
- Kill switch drill
- Disaster recovery simulation
- **OUTPUT:** OWASP test results + CVE-free audit receipt

### Phase 12: Full Validation Pass
**Duration:** 1 session | **Gate:** All gates green before any preview deploy  
- All CI suites green
- Visual regression stable
- WCAG 2.2 AA verified
- Playwright E2E suite complete
- Rollback test executed
- Scorecard computed: preview minimum 95/100, security must be 100
- **OUTPUT:** Full validation receipt + scorecard

### Phase 13: Preview Release
**Duration:** 1 session | **Gate:** Jeremy's explicit release approval  
- Deploy to Vercel preview URL (not production)
- Smoke test all routes
- Confirm no secrets leaked in responses
- **OUTPUT:** Preview URL + smoke test receipt

### Phase 14: Production Release Decision
**Gate:** Jeremy's explicit "APPROVE MERGE TO MAIN" + production deploy approval  
- All Phase 12 scores maintained on preview
- No open critical or high findings
- Jeremy reviews scorecard
- **OUTPUT:** Production deployment receipt

---

## DEPENDENCY GRAPH

### Can Run in Parallel
- Phase 0 (scaffold) has no dependencies
- Phase 10 (observability) can be scaffolded alongside Phase 4
- Phase 3 (Base44 packs) can be spec'd alongside Phase 2 (MCP gateway)
- Financial model research can begin alongside any phase

### Must Be Sequential
```
Phase 0 (scaffold)
  → Phase 1 (database)
    → Phase 4 (API layer)  → Phase 5 (agents)
    → Phase 2 (MCP)        → Phase 3 (Base44 packs)
    → Phase 7 (RAG)
    → Phase 8 (Financial)  ← BLOCKED on data provider decision
    → Phase 9 (Scraping)
  → Phase 6 (Frontend)     [can start after Phase 0, wires to Phase 4]
→ Phase 10 (Observability) [can scaffold in Phase 0, wire in Phase 4]
→ Phase 11 (Security)      [final pass after all routes exist]
→ Phase 12 (Validation)    [requires all phases complete]
→ Phase 13 (Preview)
→ Phase 14 (Production)
```

### Critical Path
Phase 0 → Phase 1 → Phase 2 → Phase 4 → Phase 12 → Phase 13 → Phase 14

### External Dependencies / Required Approvals
| Dependency | Status | Blocker |
|---|---|---|
| Financial data provider (Bloomberg, FactSet, Polygon, etc.) | ❌ Not selected | Jeremy decision + budget |
| Embedding model provider | ❌ Not selected | Jeremy decision |
| Supabase connection string for XAB | ❌ Not set | Jeremy to provide |
| CRON_SECRET for XAB | ❌ Not set | Jeremy to configure in Vercel |
| Base44 custom integration upload | ❌ Not done | Requires OpenAPI specs first |
| Domain for XAB (if separate from autobuilderos.com) | ❌ Unknown | Jeremy decision |
| MCP OAuth client credentials (Base44, GPT) | ❌ Not issued | After gateway is live |

---

## RISK REGISTER

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| R01 | Financial model claims returns it cannot guarantee | CRITICAL | HIGH | Mandatory model cards; kill switch; no autonomous execution |
| R02 | SSRF via scraper or MCP tool allows internal network access | CRITICAL | MED | Allowlist-only external requests; SSRF test in CI |
| R03 | Prompt injection corrupts agent decision via scraped content | HIGH | HIGH | Content isolation layer; injection test suite in CI |
| R04 | Cron routes lack auth — exposed to public | HIGH | LOW (mitigated in V1) | CRON_SECRET on all routes from Day 1 |
| R05 | RAG embeddings never seeded — semantic search non-functional | HIGH | HIGH | Gate Phase 7 on explicit embedding provider decision |
| R06 | MCP OAuth not compliant with current spec — GPT/Base44 connection fails | HIGH | MED | Implement against MCP authorization spec exactly; protocol test suite |
| R07 | Agent exceeds permissions — escalates own access | HIGH | MED | Hardcoded tool permission matrix per agent; no self-modification |
| R08 | Financial data license violation | HIGH | MED | Terms review before ingestion; provenance tracking |
| R09 | Scraper violates robots.txt — legal/reputational risk | HIGH | MED | RFC 9309 preflight mandatory; domain kill switch |
| R10 | Donor code blindly combined — breaks working systems | MED | HIGH | No blind copy; each function explicitly evaluated and tested |
| R11 | Secret leaks into repo or logs | CRITICAL | LOW | Secret scan in CI; CRON_SECRET never logged |
| R12 | Average score conceals critical category failure | HIGH | MED | Per-category floor: security must be 100 individually |
| R13 | GPT bridge activity conflicts with new XAB structure | MED | MED | Audit bridge commit history; ensure XAB is separate clean surface |
| R14 | Vendor lock-in to single LLM provider | MED | LOW | Abstraction layer over LLM calls; provider-agnostic interfaces |
| R15 | Credits exhausted before validation complete | MED | MED | Phase-gate approach; validate incrementally, not all at end |

---

## VALIDATION AND RECEIPT PLAN

| Test Suite | Passing Threshold | Critical Gate | Receipt Name | Evidence Location |
|---|---|---|---|---|
| Lint (ESLint) | Zero errors | YES | receipt-lint-{date} | CI log + validation_registry |
| TypeScript strict | Zero errors | YES | receipt-typescript-{date} | CI log |
| Unit tests | 100% pass | YES | receipt-unit-{date} | CI log + coverage report |
| Integration tests | 100% pass | YES | receipt-integration-{date} | CI log |
| Contract tests (API) | 100% pass | YES | receipt-contract-{date} | OpenAPI compliance report |
| DB policy tests (RLS) | 100% pass | YES | receipt-db-policy-{date} | Supabase RLS test output |
| MCP protocol tests | 100% pass | YES | receipt-mcp-protocol-{date} | Protocol compliance log |
| Agent eval suite | All eval cases pass | YES | receipt-agent-eval-{date} | Scorecard per agent |
| Security tests | Zero critical/high vulns | YES (must be 100) | receipt-security-{date} | npm audit + OWASP results |
| Prompt injection tests | Zero failures | YES | receipt-prompt-injection-{date} | Test log |
| Accessibility (axe-core) | Zero violations (WCAG 2.2 AA) | YES | receipt-a11y-{date} | axe JSON report |
| Performance (Lighthouse) | LCP<2.5s, FID<100ms | YES | receipt-perf-{date} | Lighthouse JSON |
| Playwright E2E | 100% pass | YES | receipt-e2e-{date} | Playwright report |
| Visual regression | Zero unreviewed changes | NO (warning) | receipt-visual-{date} | Screenshot diff |
| Mobile validation | All touch targets pass | YES | receipt-mobile-{date} | Device test log |
| Rollback test | Successful rollback | YES | receipt-rollback-{date} | Rollback procedure log |
| Disaster recovery sim | RTO/RPO met | YES | receipt-dr-{date} | Simulation report |

**Failure routing:**
- Critical gate failure → RepairQueue entry → auto-fix loop → re-validate
- Security/auth failures → HardeningQueue → requires explicit sign-off before re-test
- Financial model failure → quarantine model, promote challenger only on evidence

**Release blockers:**
- Any critical gate failure
- Security score < 100
- Any critical/high open finding in HardeningQueue
- Rollback test not executed
- No signed scorecard from Jeremy

---

## WORKBOOK GAP REPORT

*Based on document references — workbook itself not yet accessible for direct inspection.*

| Sheet Area | Gap Identified | Severity | Proposed Action |
|---|---|---|---|
| MCP Authorization | Document references "current MCP authorization specification" — the exact version/commit of the spec must be pinned to prevent drift | HIGH | Add citation: MCP Authorization Spec v2025-06-18 (or current) with URL |
| Base44 Integration Packs | 6 packs named but no OpenAPI specs drafted | HIGH | Draft OpenAPI spec per pack before upload |
| Financial Forecasting | No data provider named; no licensing terms reviewed; no model validation methodology cited beyond "Fed guidance" | CRITICAL | Add data provider selection worksheet + licensing checklist |
| Supabase Schemas | 31 worksheets claimed but exact table count not verifiable without direct file access | MED | Push workbook to Drive/GitHub and cross-reference against migration files |
| Agent Specifications | 20 agents referenced but no individual agent spec sheets present | HIGH | Add 1 worksheet per agent with required fields |
| Scraping | RFC 9309 cited correctly; however, no domain policy template is included | MED | Add domain policy registry template sheet |
| Security | No SSRF protection worksheet; no prompt-injection defense worksheet | HIGH | Add dedicated security worksheet per threat category |
| Testing | Playwright E2E listed but no test case registry (test IDs, expected outcomes, pass criteria) | HIGH | Add test case registry worksheet |
| Release Scoring | 100-point system described but no per-category floor scores defined except critical gates | MED | Add per-category floor score column |
| Rollback | Rollback mentioned but no rollback procedure documented with step-by-step | HIGH | Add rollback runbook worksheet |
| Environment Variables | ".env.example" mentioned but no complete variable registry with type, source, rotation policy | MED | Add env var registry worksheet |
| Receipts | Receipt format described but no receipt schema (field names, required fields, storage location) | MED | Add receipt schema worksheet |
| Source Citations | Multiple standards referenced (WCAG 2.2, RFC 9309, Fed model-risk) but no version-pinned URLs | MED | Add standards reference worksheet with URLs + retrieval dates |

**Contradictions detected:**
- Document says AUTOBUILDER-V2 is "preferred frontend donor" but memory (#89/104) confirms AUTO_BUILDER-V1 is canonical production. Both have valid roles (V1=production/MCP/governance, V2=frontend donor) — this is not a contradiction but must be explicitly documented in XAB's ARCHITECTURE.md to prevent future confusion.
- "Persistent connection must not depend on one permanent chat or socket" is correct but contradicts how some GPT Projects work today — the persistence strategy (durable job IDs, database queues, checkpoints) is the right answer and must be the implementation target.

---

## APPROVALS REQUIRED BEFORE ANY PROTECTED WORK

| Action | Required Approval |
|---|---|
| Push initial scaffold to Strategic-Minds/XAB | "APPROVE XAB SCAFFOLD" |
| Apply Supabase migration to production | "APPROVE XAB SUPABASE MIGRATION" |
| Upload Base44 integration packs | "APPROVE BASE44 PACK UPLOAD" |
| Create Vercel project linked to XAB | "APPROVE VERCEL XAB PROJECT" |
| Configure CRON_SECRET and env vars in Vercel | "APPROVE XAB ENV CONFIGURATION" |
| Financial data provider selection + contract | "APPROVE FINANCIAL DATA PROVIDER: [name]" |
| Embedding model provider selection | "APPROVE EMBEDDING PROVIDER: [name]" |
| Preview deploy to Vercel | "APPROVE XAB PREVIEW DEPLOY" |
| Merge to main / production deploy | "APPROVE MERGE TO MAIN" |

---

## VERIFIED (evidence confirmed)

- ✅ XAB repo exists at Strategic-Minds/XAB, created 2026-07-12, empty (README only)
- ✅ AUTO_BUILDER-V1 is active production: 4 cron routes, ~184 API routes, CRON_SECRET auth confirmed, live at autobuilderos.com
- ✅ AUTOBUILDER-V2 has rich adaptive frontend (30+ pages), AI SDK, Radix UI, Supabase SSR
- ✅ V1 has 10+ MCP server implementations but OAuth 2.1 compliance unconfirmed
- ✅ V1 has 8 engine services (approval, hardening, notification, queue, registry, repair, scoring, validation)
- ✅ V1 has 15 Supabase control-plane tables live
- ✅ V1 has ESLint, Playwright, TypeScript, 4 validation scripts
- ✅ V1 openapi.yaml published with 9 paths (shallow surface)
- ✅ GPT bridge (xps-admin) is active and pushing commits to V1 daily

## INFERRED (reasonable but not directly confirmed)

- ⚠️ Some V1 cron handler directories are stubs (prior audit found this pattern; specific ones not re-confirmed this session)
- ⚠️ V2 frontend routes exist as files/directories but route-level functionality not individually tested
- ⚠️ auto-builder-os is a slightly older version of V2 frontend (identical COMPLETE_TRANSFORMATION.md and IMPLEMENTATION_REPORT.md)

## COULD NOT VERIFY

- ❌ Workbook contents: REALITY_OS_BASE44_MCP_MASTER_HANDOFF.xlsx not accessible (referenced but not attached or in Drive)
- ❌ Whether V1 MCP servers pass OAuth 2.1 / MCP authorization spec compliance tests
- ❌ Exact route-level implementation depth for all 184 V1 API routes (would require reading each file)
- ❌ Whether V2 frontend is functional end-to-end (Supabase connection configured? All routes wired?)
- ❌ Financial data provider: none selected, none confirmed
- ❌ Embedding provider: none confirmed
- ❌ Whether auto-builder-os differs from AUTOBUILDER-V2 beyond package manager (pnpm vs npm)
- ❌ Base44 app ID 6a4ae522852a5e08bfa42450 entity schemas (not inspected this session)

---

## BLOCKERS

| # | Blocker | Impact | Resolution |
|---|---|---|---|
| B01 | REALITY_OS_BASE44_MCP_MASTER_HANDOFF.xlsx not accessible | Cannot complete workbook gap audit | Jeremy to share workbook file or Drive link |
| B02 | Financial data provider not selected | Phase 8 cannot start | Jeremy to select + approve budget |
| B03 | Embedding model provider not selected | Phase 7 (RAG) blocked | Jeremy to select (OpenAI recommended: text-embedding-3-large) |
| B04 | XAB Supabase project not provisioned | Phase 1 blocked | Jeremy to create new Supabase project for XAB or designate existing |
| B05 | XAB domain not decided | Phase 13 blocked | Jeremy to decide (subdomain of autobuilderos.com? new domain?) |
| B06 | Approval phrases not yet confirmed for XAB | All protected actions blocked | Confirming the list above — respond with any changes |

---

## WORKAROUNDS

- B01: Proceeded with planning based on document references + three-repo audit. Gap report will be refined once workbook is accessible.
- B02/B03: Financial and RAG phases scoped and sequenced but implementation gated on provider decisions.
- B04: Can scaffold XAB with a `.env.example` and migration files ready to apply on Jeremy's trigger.
- B05: Architecture is domain-agnostic; can deploy to Vercel preview URL until domain is decided.

---

## NEXT ACTIONS (ordered)

1. **Jeremy:** Share the REALITY_OS_BASE44_MCP_MASTER_HANDOFF.xlsx (or Drive link) so workbook gap audit can be completed
2. **Jeremy:** Decide on Supabase project for XAB (new project vs schema-isolated in existing)
3. **Jeremy:** Decide on embedding provider (recommend: OpenAI text-embedding-3-large)
4. **Jeremy:** Decide on financial data provider and budget (recommend: Polygon.io for start, FactSet for enterprise)
5. **Jeremy:** Confirm approval phrases for XAB (or use the list above as-is)
6. **Agent:** On approval, execute Phase 0 scaffold (branch-only, Jeremy reviews before any commit to XAB main)
7. **Agent:** Draft all 6 Base44 OpenAPI pack specs for Jeremy review (no upload until approved)
8. **Agent:** Draft Supabase migration files for all 35 tables for Jeremy review (no apply until approved)
