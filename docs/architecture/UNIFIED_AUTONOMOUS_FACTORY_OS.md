# XAB Unified Autonomous Factory OS

## Objective
Turn a single operator instruction into a governed application, system, agent, workflow, website, PWA, dashboard or full-stack platform at the requested maturity level: MVP, production or enterprise.

## Canonical roles

### XAB
The operator command center. XAB owns intake, project status, evidence review, approvals and release decisions. It does not independently invent a second execution stack.

### GPT Business
The strategy and visual-intelligence director. GPT owns discovery synthesis, research, specifications, copy, exactly three brand packs, exactly three web packs, approved reference images, design critique and independent parity review.

### Base44 APEX
The orchestrator and builder. Base44 owns durable registries, project state, queues, agent work packets, connector routing, Drive scaffolding, repository and preview provisioning, code coordination, repair routing and escalation.

### AUTO BUILDER 2 MCP
The execution bus. MCP exposes governed, receipt-producing tools for GitHub, Vercel, Drive, workflows, agents, AI Gateway and rollback. It is invoked by XAB/Base44, not duplicated inside every generated project.

### UACS
The universal build protocol. UACS defines the lifecycle, reusable templates, sandbox-first execution, evidence bundle and draft-PR promotion contract.

### BrowserWorker
The mandatory independent QA authority. BrowserWorker captures desktop, tablet and mobile evidence and tests all applicable routes, links, buttons, forms, APIs, auth, permissions, uploads, navigation, responsive states, PWA behavior, console output and network failures.

### Supabase
The canonical operational state layer. Supabase stores project state, queues, leases, jobs, approvals, artifacts, validations, receipts, memory metadata and audit logs under RLS. Base44 registries remain a synchronized orchestration index, not the only database.

### Drive, GitHub and Vercel
Drive is business source truth and evidence archive. GitHub is code source truth. Vercel is preview runtime, workflow heartbeat, logs and gated release runtime.

## One machine, not competing generations
The following projects are components or legacy generations, not independent authorities:
- `xtreme-builder`: Apex-style PWA/frontend generation.
- `XTREME-AI-BUILDER-GENERATOR`: narrow website generator.
- `auto-builder-os`: v0-derived dashboard generation.
- `autobuilder-v2`: prior AUTO BUILDER runtime generation.
- `xtreme-ai-builder-v2` and `xtreme-ai-builder-v3`: prior UI/runtime generations.
- `factory-control-plane`, `factory-runtime`, `parity-engine`, `template-registry`, `platform-config`, `image-pipeline`, `prompt-library`, `seo-engine`, `website-templates`: specialist services that must register beneath XAB/UACS rather than act as separate factories.

No existing project is deleted by this contract. Each is classified as canonical, component, donor, legacy reference or quarantine after evidence review.

## Lifecycle
1. REHYDRATE: load operator instruction, project ledger, Drive, Base44, GitHub, Vercel and Supabase state.
2. CLASSIFY: determine artifact type, maturity mode, risk, required connectors and acceptance criteria.
3. DISCOVER: inspect source truth, research current standards and produce a testable specification.
4. BRAND: GPT creates exactly three brand packs, three web packs and three workflow options when a new visual direction is required.
5. APPROVE: operator selects the visual/workflow direction. No implementation drifts from the approved reference.
6. PROVISION: Base44 calls MCP to create the governed Drive project, private GitHub repository or branch, Vercel preview project, Supabase sandbox/development boundary and receipt locations.
7. BUILD: Base44 routes code packets to the appropriate coding agents. All changes stay in sandbox/feature branches.
8. VALIDATE: BrowserWorker, Playwright, unit/integration tests, accessibility, security, RLS, performance and secret scans produce evidence.
9. REPAIR: failures return to the smallest responsible work packet for up to five measured repair iterations.
10. PROMOTE: passing work creates a draft PR and promotion bundle. Production remains operator-gated.
11. RELEASE: after explicit approval, deploy production, run smoke tests and automatically roll back on failed production gates.
12. DEHYDRATE: synchronize Base44, Supabase, Drive receipts, GitHub evidence and handoff state.

## Quality semantics
- MVP means the smallest approved feature set with every applicable feature working.
- Production means secure, observable, maintainable and rollback-ready.
- Enterprise means production plus resilience, scale controls, data governance, SLOs, threat modeling, disaster recovery and complete auditability.
- Visual parity is at least 99% at desktop, tablet and mobile independently.
- Operational parity is exactly 100% of applicable checks.
- Missing BrowserWorker or receipt evidence is a failure.
- An averaged score cannot override a failed mandatory gate.

## Persistent bidirectional synchronization
Each durable mutation emits an event with `event_id`, `project_id`, `correlation_id`, `source_system`, `entity_type`, `entity_id`, `version`, `content_hash`, `occurred_at`, `idempotency_key`, `receipt_url` and `rollback_ref`.

The sync engine writes the canonical event to Supabase, projects the state into Base44 registries, stores human-readable evidence in Drive, links code/runtime evidence from GitHub and Vercel, and sends internal Slack notifications when authorized. Conflicts are quarantined; they are never resolved by last-write-wins without authority rules.

## Release prohibition
No agent may self-approve production, secrets, database production migrations, protected-branch merges, domains, spending, customer messages, public publishing or destructive actions.
