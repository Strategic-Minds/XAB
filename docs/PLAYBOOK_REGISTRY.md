# XAB Playbook Registry

Last updated: 2026-07-12

## Overview
20 active playbooks organized by category. All playbooks are stored in Supabase `playbooks` table and executable via `/api/playbooks`.

## Playbooks by Category

### BUILD
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-001 | Autonomous Build Cycle | CRON */15 | ORCH-001 |

### MONITORING  
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-002 | 5-Minute Heartbeat | CRON */5 | AUDIT-002 |
| PB-015 | Vercel Build Monitor | CRON */10 | MONITOR-001 |
| PB-016 | Sandbox Resource Enforcement | CRON */5 | SANDBOX-001 |
| PB-017 | Agent Health Check | CRON */5 | ORCH-001 |

### AUDIT
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-003 | Hourly Forensic Audit | CRON 0 * | AUDIT-001 |

### REPAIR
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-004 | 15-Min Heal Loop | CRON */15 | REPAIR-001 |
| PB-005 | New Finding Auto-Repair | FINDING (S1/S2) | REPAIR-001 |
| PB-014 | DLQ Review and Requeue | CRON 0 */4 | REPAIR-001 |

### ESCALATION
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-006 | S3/S4 Finding Escalation | FINDING (S3/S4) | ORCH-001 |

### INTELLIGENCE
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-007 | Source Intelligence Ingest | CRON 0 * | RESEARCH-001 |
| PB-008 | Financial Data Refresh | CRON 0 6 daily | RESEARCH-001 |
| PB-011 | SAM.gov Opportunity Discovery | CRON 0 8 weekdays | RESEARCH-001 |
| PB-020 | Morning Intelligence Brief | CRON 0 9 weekdays | WRITER-001 |

### SECURITY
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-009 | Security Scan Cycle | CRON 0 */6 | SECURITY-001 |
| PB-019 | Quarantine Review Cycle | CRON 0 */2 | SECURITY-001 |

### BUSINESS
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-010 | New Lead Processing | EVENT: ncp_leads insert | ORCH-001 |

### GOVERNANCE
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-012 | Kill Switch Emergency Stop | EVENT: kill_switch_armed | ORCH-001 |
| PB-018 | Cost Budget Guardian | CRON */30 | AUDIT-002 |

### DOCUMENTATION
| ID | Name | Trigger | Owner |
|---|---|---|---|
| PB-013 | Documentation Auto-Update | EVENT: score_change >5pts | WRITER-001 |

## Runbooks (8 incident response guides)
| ID | Name | Category | Auto-Executable |
|---|---|---|---|
| RB-001 | Build Error Repair | REPAIR | YES |
| RB-002 | Kill Switch Activation | INCIDENT | YES |
| RB-003 | Budget Breach Response | COST_CONTROL | YES |
| RB-004 | Secret Exposure Response | SECURITY | NO (operator only) |
| RB-005 | Supabase Connection Recovery | RECOVERY | YES |
| RB-006 | PR Merge Gate Enforcement | DEPLOYMENT | NO |
| RB-007 | New Agent Onboarding | ONBOARDING | YES |
| RB-008 | Prompt Injection Response | SECURITY | YES |

## API Endpoints
- `GET /api/playbooks` — list all playbooks and recent runs
- `POST /api/playbooks` — manually trigger a playbook
- `GET /api/swarm/status` — full swarm status (agents, queues, sandboxes, score)
- `GET /api/swarm/jobs` — list jobs with filter
- `POST /api/swarm/jobs` — enqueue a new job