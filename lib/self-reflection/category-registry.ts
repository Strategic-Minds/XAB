/**
 * XAB Category Registry
 * Expandable registry of audit categories.
 * New categories can be added without rewriting the engine.
 */

export interface AuditCategory {
  id: string;
  name: string;
  weight: number;
  description: string;
  required_tests: string[];
  ceiling_minimum: number; // minimum score to be ceiling-ready
  auto_checkable: boolean;
  check_fn?: string; // name of checker function
}

export const AUDIT_CATEGORIES: AuditCategory[] = [
  { id: 'CAT-01', name: 'Governance & approvals', weight: 6, description: 'Approval gates enforced, governance docs current, receipts complete', required_tests: ['approval-gate-test', 'receipt-completeness-test'], ceiling_minimum: 90, auto_checkable: true },
  { id: 'CAT-02', name: 'Source truth & identity', weight: 5, description: 'Repo ID, Vercel project, Supabase project, Drive root all verified', required_tests: ['repo-id-check', 'source-truth-drift'], ceiling_minimum: 90, auto_checkable: true },
  { id: 'CAT-03', name: 'Architecture & modularity', weight: 5, description: 'File structure, routing, dependencies, separation of concerns', required_tests: ['build-check', 'type-check'], ceiling_minimum: 85, auto_checkable: true },
  { id: 'CAT-04', name: 'Functional correctness', weight: 7, description: 'All 19 pages render, all 27 API routes respond, chat works', required_tests: ['smoke-test', 'route-coverage'], ceiling_minimum: 90, auto_checkable: true },
  { id: 'CAT-05', name: 'Reliability & availability', weight: 6, description: 'No unhandled crashes, retries work, circuit breakers present', required_tests: ['error-boundary-test', 'retry-test'], ceiling_minimum: 90, auto_checkable: false },
  { id: 'CAT-06', name: 'Recovery & rollback', weight: 5, description: 'Rollback plan documented, tested, last-known-good identified', required_tests: ['rollback-simulation'], ceiling_minimum: 85, auto_checkable: false },
  { id: 'CAT-07', name: 'Security & threat resistance', weight: 7, description: 'SSRF controls, CSP headers, input validation, rate limiting, no secrets in code', required_tests: ['npm-audit', 'header-check', 'secret-scan'], ceiling_minimum: 90, auto_checkable: true },
  { id: 'CAT-08', name: 'Privacy & data handling', weight: 4, description: 'RLS enforced, no cross-tenant leaks, PII handling correct', required_tests: ['rls-test', 'cross-tenant-test'], ceiling_minimum: 90, auto_checkable: false },
  { id: 'CAT-09', name: 'Data integrity & persistence', weight: 5, description: 'Supabase schema healthy, FK constraints, no orphaned records', required_tests: ['schema-integrity-check', 'constraint-check'], ceiling_minimum: 85, auto_checkable: true },
  { id: 'CAT-10', name: 'Authentication & authorization', weight: 4, description: 'Auth middleware protecting all routes, JWT valid, CRON_SECRET enforced', required_tests: ['auth-route-test', 'cron-auth-test'], ceiling_minimum: 90, auto_checkable: true },
  { id: 'CAT-11', name: 'Observability & auditability', weight: 5, description: 'Audit logs, receipts, evidence ledger, heartbeat health recorded', required_tests: ['audit-log-test', 'receipt-presence-test'], ceiling_minimum: 85, auto_checkable: true },
  { id: 'CAT-12', name: 'Performance & latency', weight: 5, description: 'API p95 < 2s, page LCP < 3s, no N+1 queries', required_tests: ['lighthouse-check', 'api-latency-check'], ceiling_minimum: 80, auto_checkable: false },
  { id: 'CAT-13', name: 'Scalability & concurrency', weight: 4, description: 'No global state races, idempotency keys on mutations, distributed lock', required_tests: ['idempotency-test', 'concurrency-test'], ceiling_minimum: 80, auto_checkable: false },
  { id: 'CAT-14', name: 'Cost efficiency & budgets', weight: 3, description: '$50/night cap enforced, KS-002 armed on budget breach, spend logged', required_tests: ['spend-log-check', 'kill-switch-test'], ceiling_minimum: 80, auto_checkable: true },
  { id: 'CAT-15', name: 'AI quality & evaluation', weight: 6, description: 'LLM responses cited, no hallucinations in safety content, model routing correct', required_tests: ['ai-grounding-test', 'safety-content-test'], ceiling_minimum: 85, auto_checkable: false },
  { id: 'CAT-16', name: 'Agent orchestration & autonomy', weight: 5, description: 'All agents have bounded permissions, no self-approval, receipts required', required_tests: ['agent-permission-test', 'agent-receipt-test'], ceiling_minimum: 85, auto_checkable: true },
  { id: 'CAT-17', name: 'Memory/RAG & freshness', weight: 4, description: 'RAG chunks embedded, stale sources flagged, retrieval tested', required_tests: ['rag-retrieval-test', 'embedding-freshness-check'], ceiling_minimum: 80, auto_checkable: true },
  { id: 'CAT-18', name: 'Connector & tool safety', weight: 4, description: 'GitHub/Supabase/Drive connectors least-privilege, receipts on every write', required_tests: ['connector-scope-test', 'write-receipt-test'], ceiling_minimum: 85, auto_checkable: true },
  { id: 'CAT-19', name: 'UX accessibility & visual quality', weight: 5, description: 'WCAG 2.2 AA, keyboard nav, AUTOBUILDER-2.0 layout preserved', required_tests: ['axe-check', 'visual-parity-check'], ceiling_minimum: 80, auto_checkable: false },
  { id: 'CAT-20', name: 'Testing release & maintainability', weight: 5, description: 'CI passing, Playwright suite present, docs current', required_tests: ['ci-status-check', 'playwright-check', 'docs-freshness-check'], ceiling_minimum: 85, auto_checkable: true },
];

export function getCategoryById(id: string): AuditCategory | undefined {
  return AUDIT_CATEGORIES.find(c => c.id === id);
}

export function getAutoCheckableCategories(): AuditCategory[] {
  return AUDIT_CATEGORIES.filter(c => c.auto_checkable);
}
