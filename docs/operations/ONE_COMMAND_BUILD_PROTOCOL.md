# One-Command Universal Build Protocol

## Operator command

```text
Build <artifact> for <business/use case> in <mode: MVP|production|enterprise>.
Use <approved references or existing brand>.
Required outcomes: <features and integrations>.
```

The command may be shorter. XAB and GPT must infer only non-material defaults. Material uncertainty becomes a clearly labeled assumption or approval item.

## Example

```text
Build a production-grade national contractor bidding platform for National Concrete Polishing. Use the approved Xtreme AI Systems brand. Include project discovery, plan/spec intake, AI takeoff, pricing, proposals, contractor CRM, email workflows, dashboards and mobile PWA behavior.
```

## Required generated build packet
Every command becomes one immutable build packet containing:
- project ID and correlation ID;
- artifact type and maturity mode;
- operator objective and measurable acceptance criteria;
- approved brand/web pack references;
- feature and integration matrix;
- data classification and security requirements;
- selected reusable templates;
- Drive, GitHub, Vercel and Supabase targets;
- assigned GPT, Base44, MCP, coding-agent and BrowserWorker lanes;
- test plan and required evidence;
- protected actions and approval requirements;
- rollback plan;
- budget and model-routing policy;
- final receipt locations.

## Automatic routing

### GPT lane
1. Translate intent into testable requirements.
2. Research and benchmark where current evidence is required.
3. Reuse an approved brand or create exactly three brand packs.
4. Reuse an approved web pack or create exactly three web packs.
5. Produce copy, visual source truth and acceptance rubric.
6. Independently review BrowserWorker evidence and parity results.

### Base44/APEX lane
1. Register the project and create queues.
2. Create or locate Drive source truth.
3. Call AUTO BUILDER MCP provisioning tools.
4. Create GitHub feature branches or a project repo.
5. Create Vercel preview and sandbox configuration.
6. Create the Supabase development boundary after the approved cost/account gate.
7. Route implementation packets to coding agents.
8. Track retries, failures, approvals and receipts.
9. Generate draft promotion PRs.

### AUTO BUILDER MCP lane
Use governed tools such as `run_universal_job`, `run_drive_job`, `run_platform_provisioning_job`, `create_github_repo`, `create_vercel_project`, `create_vercel_workflow`, `create_vercel_sandbox`, `create_ai_gateway`, `create_vercel_agent` and `rollback`. Every write must include scope, mode, approval state, receipt requirements and rollback metadata.

### BrowserWorker lane
1. Verify worker health and capabilities.
2. Capture approved-reference and preview screenshots.
3. Test desktop, tablet and mobile.
4. Exercise applicable routes, buttons, links, forms, APIs, auth, roles, uploads, navigation, error states and PWA behavior.
5. Capture console and network evidence.
6. Return signed result IDs, artifacts and defect classifications.

## Repair loop
A failed test creates one repair packet assigned to the smallest responsible lane. The system may perform up to five branch-only repair iterations. It must stop and escalate when:
- the same defect repeats;
- the specification conflicts with the approved reference;
- the fix requires a protected action;
- the model lacks confidence;
- the fifth repair attempt fails.

## Completion definitions

### MVP complete
All approved MVP features work, all applicable checks pass, visual parity is at least 99% at each breakpoint, operational parity is 100%, and a rollback reference exists.

### Production complete
MVP completion plus security, observability, RLS, performance, production runbooks, smoke tests and operator-approved release.

### Enterprise complete
Production completion plus threat model, SLOs, load/resilience tests, disaster recovery, data governance, auditability and verified operational ownership.

## Forbidden shortcuts
- Building directly on `main`.
- Creating production before a preview passes.
- Treating a mockup, README, entity record or HTTP 200 as operational proof.
- Claiming 99% parity without screenshot-diff artifacts.
- Claiming 100% functionality without an applicable-feature test ledger.
- Treating absent evidence as a pass.
- Allowing Base44, GPT or an agent to approve its own protected action.
