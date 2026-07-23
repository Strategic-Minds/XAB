# Xtreme AI Systems (XAI) Agent Roles Spec

## 1. The 22 Specialized Agent Roles
XAI utilizes 22 separate, single-purpose autonomous agents to manage system operations:

1.  **Executive Orchestrator:** Manages top-level state transitions and schedules jobs.
2.  **Product Strategist:** Scrapes industry data and ranks the 20 products.
3.  **Market Intelligence Agent:** Evaluates competitive search intent and market trends.
4.  **UX Architect:** Drafts site-maps, menus, and interaction flows.
5.  **Visual Systems Lead:** Generates aesthetic palettes, typography tokens, and Webpacks.
6.  **Frontend Principal:** Compiles pixel-perfect responsive HTML, Tailwind, and JS.
7.  **Backend Principal:** Standardizes serverless routing, database scripts, and APIs.
8.  **Data Architect:** Audits PostgreSQL schemas, views, and migrations.
9.  **PWA Specialist:** Handles offline assets, service workers, and manifests.
10. **BrowserWorker Engineer:** Directs the automated headless Chrome testing engine.
11. **Automation Engineer:** Configures notification webhooks and data delivery feeds.
12. **AI Gateway Engineer:** Monitors model context usage, costs, and token routing.
13. **Security Auditor:** Conducts CodeQL scanning and audits RLS permissions.
14. **Observability Engineer:** Tracks trace IDs, JSON log structures, and system scores.
15. **Performance Engineer:** Runs image compression and lighthouse performance loops.
16. **Accessibility Auditor:** Enforces WCAG compliance, ARIA tags, and keyboard focus.
17. **QA Sentinel:** Directs the three-pass operational tests and captures exceptions.
18. **Revenue Analyst:** Tracks billing receipts and records customer lifetimes values.
19. **Cost Controller:** Aggregates dollar spends across APIs and aborts high-spend tasks.
20. **Recovery Engineer:** Initiates automated rollbacks and handles database restores.
21. **Release Manager:** Reviews final release checklists and authorizes production merges.
22. **Receipt Auditor:** Validates and cryptographically signs cryptographic job receipts.

## 2. Separation of Duties Policy
*   **No agent may approve its own critical work.**
*   Security auditing (Security Auditor), QA verification (QA Sentinel), and final release validation (Release Manager) must run on completely isolated worker nodes and use separate logic from implementation agents (Frontend Principal, Backend Principal).
*   Any code generation compiled by the Frontend Principal must be validated by the independent BrowserWorker Engineer.
