# XAB 95% Ceiling Readiness Scoring Model

## Principle
The score is NEVER inflated by weakening tests, hiding failures, or excluding categories.
An UNVERIFIED category incurs a penalty. An untested category cannot be PASSING.

## Formula
```
weighted_sum = sum(category_composite * weight for each category)
raw_score = weighted_sum / total_weight
final_score = raw_score - (open_critical_findings * 3 / 10)
```

## Category Weights (total = 100)
| ID | Category | Weight |
|---|---|---|
| CAT-01 | Governance & approvals | 6 |
| CAT-02 | Source truth & identity | 5 |
| CAT-03 | Architecture & modularity | 5 |
| CAT-04 | Functional correctness | 7 |
| CAT-05 | Reliability & availability | 6 |
| CAT-06 | Recovery & rollback | 5 |
| CAT-07 | Security & threat resistance | 7 |
| CAT-08 | Privacy & data handling | 4 |
| CAT-09 | Data integrity & persistence | 5 |
| CAT-10 | Authentication & authorization | 4 |
| CAT-11 | Observability & auditability | 5 |
| CAT-12 | Performance & latency | 5 |
| CAT-13 | Scalability & concurrency | 4 |
| CAT-14 | Cost efficiency & budgets | 3 |
| CAT-15 | AI quality & evaluation | 6 |
| CAT-16 | Agent orchestration & autonomy | 5 |
| CAT-17 | Memory/RAG & freshness | 4 |
| CAT-18 | Connector & tool safety | 4 |
| CAT-19 | UX accessibility & visual quality | 5 |
| CAT-20 | Testing release & maintainability | 5 |

## 95% Ceiling Gates (ALL must pass)
- Composite score ≥ 95
- Zero S4_CRITICAL findings open
- Zero unapproved S3_HIGH production risks
- Every category composite ≥ 90
- All smoke tests PASS
- All regression tests PASS
- Security scan PASS
- Rollback validation PASS
- Cron health PROVEN
- Workflow durability PROVEN
- Database integrity PROVEN
- RLS tests PASS
- Evidence receipts EXIST
- No UNVERIFIED categories
- Score not achieved by weakening tests

## Separate Score Components
- Current verified score
- Potential score after approved repairs
- Confidence level (% categories verified)
- Evidence coverage
- Open risk penalty
- Unverified category penalty
- Regression penalty
