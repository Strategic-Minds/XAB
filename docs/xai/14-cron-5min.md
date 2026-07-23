# Xtreme AI Systems (XAI) 5-Minute Heartbeat Spec

## 1. Orchestrated System Functions
The heartbeat endpoint `/api/cron/xab-heartbeat` executes every 5 minutes and runs the following critical routines:
1.  **BrowserWorker Health Check:** Pings the canonical browser API to ensure it is online and responsive.
2.  **Supabase Health Check:** Validates active database connection pooling.
3.  **Queue Polling:** Audits pending items across the 25 system queues and triggers worker leases.
4.  **Stale Job Recovery:** Identifies claimed jobs whose leases have expired, resets their state to `QUEUED`, and increments failure count.
5.  **Cost Anomaly Detection:** Scrapes active billing APIs to flag and halt any system executing beyond designated dollar boundaries.
6.  **Alert Firing:** Dispatches critical email alerts via Resend API in the event of system failures.

## 2. Heartbeat Circuit Breaker
*   If the BrowserWorker API fails to respond to 3 consecutive heartbeat health checks, the system enters **DEGRADED** mode.
*   In **DEGRADED** mode, all automatic promotion-to-production queues are immediately locked, and notifications are sent to the system operators.

## 3. System Health Scoring System
The heartbeat computes a numeric system score out of 100 points:
*   **Initial Score:** 100 points.
*   **Deductions:**
    *   `-25` if BrowserWorker is down or unreachable.
    *   `-30` if Supabase database queries fail or timeout.
    *   `-5` for each missing required environment variable in production.

### Operational Health Tiers:
*   **ELITE (Score $\ge 95$):** All systems functioning perfectly. Releases permitted automatically.
*   **PRODUCTION_READY (Score $\ge 80$):** Minor issues, but core systems are active. Normal operations allowed.
*   **DEGRADED (Score $\ge 60$):** BrowserWorker down or credentials failing. Visual release gates locked.
*   **CRITICAL (Score $< 60$):** Supabase down or major environment variables missing. Entire system enters complete lock-down.
