# Xtreme AI Systems (XAI) Queue System Spec

## 1. The 25 System Queues
XAI is a fully asynchronous, message-driven operating system. All actions are cataloged, claimed, and executed via 25 designated queues.

1.  **Product Discovery Queue:** Scrapes new product ideas.
2.  **Service Discovery Queue:** Scrapes new service ideas.
3.  **Product Scoring Queue:** Evaluates potential concrete market products.
4.  **Service Scoring Queue:** Evaluates potential concrete service opportunities.
5.  **GPT Favorites Queue:** Filters high-margin suggestions selected by GPT.
6.  **Human Review Queue:** Holds projects awaiting operator signature.
7.  **Approved Opportunity Queue:** Opportunities ready for business planning.
8.  **Build-Ready Bucket Queue:** Projects with complete specs, ready for webpack creation.
9.  **Active Build Queue:** Code compilation and environmental provisioning.
10. **Approved Webpack Queue:** Design lock confirmation and visual contract generation.
11. **BrowserWorker Validation Queue:** Sends pages to BrowserWorker for screenshots and audits.
12. **Automated Repair Queue:** Triggers repair loops on visual or code failures.
13. **Three-Pass Operational Test Queue:** Executes sequential operational runs.
14. **Visual Parity Queue:** Triggers pixel-comparison between output and Webpack.
15. **PWA Validation Queue:** Audits manifest, service worker, and install criteria.
16. **Preview Approval Queue:** Aggregates all testing receipts for review.
17. **Release Approval Queue:** Final automated gatekeeper prior to production merge.
18. **Production Release Queue:** Production code promotion and database migration.
19. **Revenue Monitoring Queue:** Scrapes checkout metrics and billing status.
20. **Continuous Optimization Queue:** Schedules post-release A/B testing and updates.
21. **Failed Job Queue:** Holds transient job errors for auto-retry evaluation.
22. **Dead-Letter Queue (DLQ):** Non-retryable, broken, or exhausted jobs.
23. **Recovery Queue:** Executes backup restorations and schema rollbacks.
24. **Security Review Queue:** Scrapes logs for credentials and anomalous rate behaviors.
25. **Cost Anomaly Queue:** Flags jobs exceeding designated cost boundaries.

## 2. Inviolable Job Schema
Every record in any queue table MUST strictly contain the following fields:
```json
{
  "job_id": "UUID v4",
  "opportunity_id": "UUID v4",
  "parent_project_id": "UUID v4",
  "classification": "PRODUCT | SERVICE",
  "category": "String (e.g., surface_prep)",
  "subcategory": "String (e.g., planetary_grinders)",
  "priority": "INTEGER (0 to 10, 0 = highest)",
  "state": "QUEUED | PROCESSING | COMPLETED | FAILED | BLOCKED",
  "assigned_agent": "String (e.g., QA_Sentinel)",
  "lock_owner": "String (e.g., worker_node_023)",
  "lease_expiration": "TIMESTAMP WITH TIME ZONE",
  "retry_count": "INTEGER",
  "max_retries": "INTEGER",
  "created_at": "TIMESTAMP WITH TIME ZONE",
  "updated_at": "TIMESTAMP WITH TIME ZONE",
  "started_at": "TIMESTAMP WITH TIME ZONE",
  "completed_at": "TIMESTAMP WITH TIME ZONE",
  "input_checksum": "SHA-256 string",
  "output_checksum": "SHA-256 string",
  "approval_status": "PENDING | APPROVED | REJECTED",
  "cost_estimate": "NUMERIC(10,4) (USD)",
  "actual_cost": "NUMERIC(10,4) (USD)",
  "expected_roi": "NUMERIC(10,4) (percentage)",
  "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "evidence_refs": "Array of URIs (receipts/logs)",
  "rollback_ref": "SHA-256 or previous stable job UUID",
  "failure_classification": "String (e.g., WEBPACK_MISMATCH)",
  "next_eligible_action": "String (next state route)"
}
```

## 3. Queue Protection Policies
*   **Idempotency Keys:** Every job must present a unique token. Duplicate requests must yield existing outputs.
*   **Job Leases:** Active processing locks a job for 60 seconds. Workers must heartbeat or lose the lease.
*   **Retry Backoff:** Exponential delay ($2^{retry\_count} \times 5$ seconds) applied automatically to temporary failures.
*   **Concurrency Limits:** Global job limits restricted based on Vercel and OpenAI API quotas.
*   **Dead-Letter Routing:** On reaching `max_retries`, jobs automatically shift to DLQ.
*   **Poison-Job Detection:** Immediate DLQ routing for jobs causing worker process crashes.
*   **Max Spend Controls:** Jobs exceeding cost estimates by $>20\%$ are automatically aborted and flagged as cost anomalies.
