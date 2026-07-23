# Xtreme AI Systems (XAI) Recovery Procedures

## 1. Standard Incident Recovery Paths
When an incident is logged, the Recovery Engineer Agent executes targeted restoration procedures:

*   **BrowserWorker Outage Recovery:** Pings alternative browser instances. If alternative pings fail, all visual verification tasks are paused until the main endpoint is restored.
*   **Database Corruption Recovery:** Restores the last stable 24-hour backup, replays incremental transaction logs up to the corruption stamp, and verifies schema constraints.
*   **Stuck/Duplicate Queue Jobs:** Purges all stale leases (lease expiration $< now$), resets retry counters, and verifies idempotency keys before restarting queue workers.
*   **Failed Production Smoke Test:** Triggers immediate Vercel deployment rollback and flags the broken release version.

## 2. Bounded Repair Loop Policies
All automated repair loops are strictly bounded to prevent resource depletion:
*   **Maximum Repair Attempts:** Exactly **3 attempts** per build.
*   **Cost Ceiling:** Max **$3.00 USD** total API spend per repair loop.
*   **Time Limit:** A single repair attempt must complete in **5 minutes**.
*   **Failure Threshold:** If 3 repair runs fail, the system must set status to `BLOCKED`, cease automated attempts, and compile a diagnostic packet for human operator review.
