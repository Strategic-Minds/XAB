# XAB Repair Authority Matrix

## What the Engine CAN do autonomously
- Read logs, telemetry, test results
- Run and generate tests
- Reproduce failures in sandbox
- Restart safe non-production jobs
- Create branches and commits
- Create preview deployments
- Run smoke, integration, security, accessibility tests
- Create pull requests
- Update draft docs
- Generate rollback artifacts
- Reject and roll back its own failed repairs

## What ALWAYS requires operator approval
| Action | Required Phrase |
|---|---|
| Production deploy | `APPROVE PRODUCTION DEPLOY` |
| Merge to main | `APPROVE MERGE TO MAIN` |
| DB migration | `APPROVE SUPABASE MIGRATION` |
| Env/secret change | `APPROVE ENV CHANGE` |
| DNS change | `APPROVE DNS CHANGE` |
| Paid resource | `APPROVE PAID RESOURCE` |
| Customer comms | `APPROVE CUSTOMER MESSAGE` |
| Destructive delete | `APPROVE DESTRUCTIVE DELETE` |
| Governance change | `APPROVE GOVERNANCE CHANGE` |
| Permission escalation | `APPROVE PERMISSION CHANGE` |

## The engine NEVER
- Deploys to production autonomously
- Merges protected branches
- Weakens RLS or auth
- Increases its own permissions
- Conceals errors or failures
- Rewrites governance rules
- Modifies audit history
