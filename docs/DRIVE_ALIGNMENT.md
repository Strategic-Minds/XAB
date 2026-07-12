# XAB Google Drive Alignment

## Drive Root
Folder ID: 1t278PMC-qmKRe1B2z_FM6T4i3OFv0_Un

## Structure (31 top-level folders)
00_Master_Control — kill switches, cost ledger, incident log, daily briefings
01_Architecture — system, agent, data, security, workflow architecture docs
02_Data_Schema — schema versions, RLS policies, ERD diagrams, seed data
03_MCP_Gateway — gateway specs, OpenAPI packs, client auth, V1 migration
04_Base44_Packs — CORE_ORCHESTRATOR, FINANCE_INTELLIGENCE, SCRAPER_INTELLIGENCE
05_Agent_System — 28 agent specs, multi-agent chat, pub/sub, evaluations
06_Frontend — wireframes, brand, visual baselines, accessibility
07_Backend_API — cron heartbeat, workflow engine, queue system, dead letter
08_RAG_Memory — embedding specs, chunk registry, retrieval policy
09_Financial_Intelligence — models, backtests, forecasts
10_Scraping_Intelligence — crawl policy, extracted entities, provenance
11_Observability — metrics, alerts, agent heartbeats, SLA reports
12_Security — RLS audit, secret rotation, pen tests, compliance
13_Validation_Testing — test suites, Playwright, Sentinel, rollback tests
14_Receipts — intent/result/approval/rollback/repair/heartbeat receipts
15_Governance — operator decisions, kill switches, change log, audit trail
16_Workbooks — controlling workbooks (95% Ceiling Program)
17_Handoffs — GPT, Base44, Codex, client handoffs
18_Artifacts — branch, preview, production artifacts
19_Release — gates, rollback packets, production approvals
20_Final_Audit — drift reports, scorecard history, repair history
21_Swarm_OS — overnight ops, repair loop, dead letter queue, heartbeat
22_Agent_Swarm — 28 agent specs, evaluations, leases
23_Client_Projects — pipeline, completed, templates, deliverables
24_Business_Operations — invoices, contracts, KPI dashboard
25_Intelligence_Library — industry reports, competitor research, tech radar
26_Brand_Assets — logos, colors, typography
27_Templates — proposals, contracts, reports, emails
28_Comms_Outreach — social content, email campaigns, brand voice
29_Financial_Forecasting — cost models, pricing, cash flow
30_Autonomous_Ops_Log — ops log, incident reports, decision log

## Alignment Rules
- Every branch artifact → 18_Artifacts/18A_Branch_Artifacts
- Every receipt → 14_Receipts (correct subfolder by type)
- Every operator decision → 15_Governance/15C_Operator_Decisions
- Every morning brief → 00_Master_Control/00F_Daily_Briefings
- Every scorecard → 20_Final_Audit/20B_Scorecard_History
- Every approval request → 15_Governance/15B_Approval_Requests
