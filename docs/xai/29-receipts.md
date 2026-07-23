# Xtreme AI Systems (XAI) Receipt Requirements

## 1. Standard Verification Receipts
No autonomous agent may transition a job to `COMPLETED` without providing a cryptographically signed, durable verification receipt. The receipt must utilize the following structured layout:

*   **VERIFIED:** Lists verified facts, code locations, database writes, and active tests.
*   **INFERRED:** Outlines reasonable assumptions or secondary configurations.
*   **COULD NOT VERIFY:** Lists components, third-party APIs, or screens that were inaccessible during the run.
*   **BLOCKERS:** Explicitly lists issues preventing progress (e.g., missing credentials).
*   **WORKAROUNDS:** Detailed alternative methods executed to bypass blockers.
*   **RECEIPTS:** List of specific SHA-256 hashes, PR links, test run IDs, and screenshot URLs.
*   **ROLLBACK:** Specific reversal commands or references required to rollback the agent's changes.
*   **NEXT ACTIONS:** Smallest, actionable next steps required to continue progress.

## 2. Receipt Integrity Policy
*   Receipts are stored in the database's `receipt_ledger` table and are immutable.
*   The system rejects any job status promotion if the corresponding validation receipt is missing or incomplete.
