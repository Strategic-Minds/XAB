# Xtreme AI Systems (XAI) Continuity Ledger Spec

## 1. Ledger Architecture
The Continuity Ledger is the immutable, append-only central audit record of all state modifications within the XAI operating system. It provides a reliable historical audit trail.

## 2. Record Schema
Every entry in the Continuity Ledger must strictly contain:
*   `timestamp`: Exact ISO-8601 timestamp with microsecond accuracy.
*   `cycle_id`: Current 5-minute heartbeat cycle UUID.
*   `event_type`: Type of state change (e.g., `DEPLOYMENT_PROMOTE`, `QUEUE_CLAIM`).
*   `system`: Target system or component.
*   `before_state`: State signature before change.
*   `after_state`: State signature after change.
*   `evidence_refs`: Array of verification receipts or comparison hashes.
*   `operator`: Authorizing operator identifier (agent name or human ID).
*   `automated`: Boolean indicating if change was executed autonomously.
*   `rollback_available`: Boolean indicating if rollback was configured.

## 3. Ledger Rules
*   **Sandbox Survival:** The ledger is written to physical Supabase storage and must survive sandbox resets.
*   **No Overwrites:** No database connection, user, or service role key has permission to delete or overwrite records in the `continuity_ledger` table.
