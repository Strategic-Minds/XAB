# Xtreme AI Systems (XAI) Incident Response Spec

## 1. Incident Classification and Containment
XAI is designed to self-heal. However, when critical anomalies occur, the system triggers rapid response protocols.

*   **BrowserWorker Outage:** Trips the health circuit breaker, locks visual gates, and shifts the system to degraded mode.
*   **Database Outage:** Freezes queue polling and prevents all state writes.
*   **Queue Corruption:** Purges active leases and routes corrupted logs to the DLQ.
*   **Deployment Failure:** Halts the release gate, reverts code to the last stable commit, and schedules a build repair job.
*   **Security Breach:** Disables all active API keys and locks row access policies.

## 2. Mandatory Incident Record Schema
Every incident generates a structured incident ticket containing:
```json
{
  "incident_id": "UUID v4",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "detection_source": "HEARTBEAT | SECURITY_SCAN | OPERATOR_FLAG",
  "start_time": "TIMESTAMPTZ",
  "affected_systems": ["Array of targets"],
  "user_impact": "Details of user exposure",
  "containment_action": "Automated containment steps executed",
  "root_cause": "Scraped error message or stack trace",
  "repair_action": "Remediation log",
  "validation_receipt": "BrowserWorker audit URL",
  "rollback_executed": "Boolean",
  "recovery_time_seconds": "INTEGER",
  "prevention_action": "Next steps configuration",
  "owner": "Responsible agent/operator",
  "closure_receipt": "Signed closure verification hash"
}
```
