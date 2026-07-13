# JEREMY APEX-20 — Sovereign AI System

**Status:** INSTALLED — PREVIEW BRANCH (Production locked until B44-12 release gate)
**Workbook Score:** 100/100 (workbook completeness)
**Source SHA-256:** 437c926f0b8f9813fd93aea3061acf6db25b6f93c8133158e867c5c93a4fcf98
**Installed:** 2026-07-13

## Operator Selections (B44-03 CLEARED)
- **Brand:** BP-01 Sovereign Black — black/white/platinum, JetBrains Mono
- **UI:** UI-01 Command Center — far-left icon nav + left chat + right editor (3-panel)
- **Workflow:** WF-03 Hybrid Adaptive — A01 decomposes → parallel + sequential lanes dynamically

## 20-Agent Swarm (A01–A20)
| ID | Agent | Mission |
|----|-------|---------|
| A01 | Apex Chief Orchestrator | Task graph + approval enforcement |
| A02 | Source Truth and Research Director | Evidence collection + claim classification |
| A03 | Product and Strategy Principal | Requirements + acceptance criteria |
| A04 | Enterprise Systems Architect | 20 ARCH layers + ADRs |
| A05 | UX and IA Director | UI-01 Command Center design |
| A06 | Visual and Brand Systems Director | BP-01 Sovereign Black tokens |
| A07 | Frontend Engineering Principal | Next.js App Router shell |
| A08 | Creative Editor Principal | Right-panel canvas + generative UI |
| A09 | Backend and API Principal | APIs + queues + idempotency |
| A10 | Data + Supabase Architect | apex20_ schema + RLS |
| A11 | Intelligence + RAG Scientist | Hybrid retrieval + memory |
| A12 | Model Router + Eval Scientist | Model routing + benchmarks |
| A13 | MCP + A2A Tooling Engineer | Tool discovery + Agent Cards |
| A14 | Durable Workflow Engineer | WF-03 DAGs + heartbeat |
| A15 | Browser + Computer-Use Operator | Governed web data acquisition |
| A16 | Security Red-Team Director | 30 adversarial test cases |
| A17 | Privacy + Governance Officer | Owner binding + RLS compliance |
| A18 | Observability + SRE Principal | OTel + Prometheus (95% ceiling fix) |
| A19 | Continuous Improvement Director | Eval catalogs + optimization |
| A20 | Validation + Independent Auditor | Read-only gate. Final release authority |

## Supabase Schema
20 `apex20_` tables — additive to existing 126 XAB tables.
See `apex20_schema.sql` for full DDL + RLS + indexes.

## Install Sequence Status
- [x] B44-01: Workbook ingested (100/100, 71 sheets)
- [x] B44-02: Requirements mapped (60 REQ-IDs)
- [x] B44-03: Selection gate cleared (BP-01 + UI-01 + WF-03)
- [x] B44-04: Checkpoint created (branch: feature/apex20-install)
- [x] B44-05: Superagent configured (A01 orchestrator)
- [x] B44-06: Specialists configured (A02-A20)
- [x] B44-07: App shell specified
- [ ] B44-08: Schema migration (APPROVED — execute against live Supabase)
- [ ] B44-09: Workflow + PWA
- [ ] B44-10: Validation
- [ ] B44-11: Repair
- [ ] B44-12: Release gate (requires Jeremy approval)

## XAB Integration
APEX-20 is installed as an intelligence + orchestration layer on top of XAB.
- A18 (Observability) directly resolves the XAB 95% ceiling blocker
- A02 (Research) feeds the data intelligence acquisition system
- A15 (Browser) is the scraping operator for authorized targets
- All agents use existing XAB Supabase (azajysheebfhyzoyplpf)

## Production Status
**PRODUCTION_LOCKED** until B44-12 release gate passed with Jeremy approval.
