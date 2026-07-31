# Base44 + GPT Persistent Synchronization Contract

## Purpose
Provide durable, idempotent project continuity across GPT Business, Base44, Supabase, Drive, GitHub, Vercel, BrowserWorker and Slack without pretending that chat memory is the database.

## Authority order
1. Current explicit operator instruction.
2. Current approved workbook, visual reference or signed control packet.
3. Runtime and validation evidence.
4. Supabase canonical event/state record.
5. Base44 registries and queues.
6. GitHub commits, branches and pull requests.
7. Drive source truth and receipts.
8. Vercel deployment and log evidence.
9. Prior summaries.
10. Inference.

## Canonical event envelope
Every durable change uses:

```json
{
  "event_id": "uuid",
  "project_id": "stable-project-id",
  "correlation_id": "uuid",
  "source_system": "gpt|base44|mcp|drive|github|vercel|supabase|browserworker|slack",
  "entity_type": "project|job|artifact|approval|validation|receipt|deployment|decision",
  "entity_id": "stable-entity-id",
  "operation": "created|updated|validated|failed|approved|rejected|promoted|rolled_back",
  "version": 1,
  "content_hash": "sha256",
  "idempotency_key": "project:entity:operation:version",
  "occurred_at": "ISO-8601",
  "actor": "operator|gpt|base44|mcp|browserworker|system",
  "authority_level": "operator|approved-source|runtime|registry|inference",
  "receipt_url": "durable-evidence-url",
  "rollback_ref": "commit|deployment|migration|event-id",
  "payload": {}
}
```

## Write sequence
1. Validate event schema and authority.
2. Reject duplicate `idempotency_key` and matching content hash.
3. Append the canonical event to Supabase.
4. Project current state into Base44 registries.
5. Store human-readable receipt or artifact in Drive.
6. Attach GitHub/Vercel/BrowserWorker evidence URLs.
7. Post an internal Slack status only when OAuth and message policy allow it.
8. Return one synchronization receipt.

## Conflict behavior
Conflicting updates are placed in a conflict queue with both versions, authority labels and hashes. Last-write-wins is prohibited for operator decisions, approved visuals, release state, schema migrations, protected actions and production configuration.

## Required Base44 registry projections
- SystemRegistry: authority map, drift and current capability state.
- ProjectRegistry: stage, queue, branch, PR, preview and next action.
- WorkflowRegistry: heartbeat, jobs, retry state and last execution.
- ApprovalQueue: every protected action.
- ArtifactRegistry: workbooks, references, screenshots, commits and reports.
- ValidationRegistry: each individual gate, not only an aggregate score.
- ReceiptRegistry: every write, failure, rollback and release event.
- OperatorDecisionRegistry: selected brand/web/workflow option and superseding decisions.
- ConnectorRegistry: verified scopes, account identity and last test result.

## Offline and retry policy
Failed projections do not rewrite canonical history. They enter a retry queue with exponential backoff and a dead-letter queue after the configured retry ceiling. The five-minute heartbeat retries projections, detects stalled jobs, verifies leases and creates escalation receipts.

## Security
No secret values are stored in events, Base44 records, Drive receipts, GitHub or chat. Events may name required environment variables and secret owners, but never reveal values.

## Completion standard
Synchronization is not called bidirectional or persistent until round-trip, duplicate-event, conflict, offline-retry, dead-letter, permission, rollback and recovery tests all pass with durable receipts.
