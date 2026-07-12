/**
 * XAB Audit Engine
 * Runs structured audit cycles across all 20 categories.
 * OBSERVE -> SNAPSHOT -> AUDIT -> ANALYZE -> DIAGNOSE -> PLAN ->
 * RISK-CLASSIFY -> REPAIR -> HEAL -> HARDEN -> OPTIMIZE ->
 * ENHANCE -> VALIDATE -> SCORE -> DOCUMENT -> LEARN -> ESCALATE
 */

export type Severity = 'S0_INFORMATIONAL' | 'S1_LOW' | 'S2_MODERATE' | 'S3_HIGH' | 'S4_CRITICAL';
export type Confidence = 'VERIFIED' | 'HIGH_CONFIDENCE' | 'INFERRED' | 'UNKNOWN';
export type RepairAuthority = 'READ_ONLY' | 'AUTO_SAFE' | 'BRANCH_ONLY' | 'PREVIEW_ONLY' | 'APPROVAL_REQUIRED' | 'PROHIBITED';
export type RepairUrgency = 'IMMEDIATE' | 'NEXT_HEARTBEAT' | 'NEXT_HOURLY' | 'SCHEDULED_BACKLOG' | 'OPERATOR_DECISION';

export interface AuditFinding {
  finding_id: string;
  timestamp: string;
  run_id: string;
  affected_component: string;
  category_id: string;
  severity: Severity;
  confidence: Confidence;
  repair_authority: RepairAuthority;
  repair_urgency: RepairUrgency;
  title: string;
  evidence: string[];
  root_cause_hypothesis: string;
  reproduction_steps: string[];
  proposed_repair: string;
  repair_risk: string;
  required_tests: string[];
  rollback_plan: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  owner_agent: string;
  current_state: string;
}

export interface AuditRun {
  run_id: string;
  started_at: string;
  completed_at: string | null;
  trigger: 'HEARTBEAT' | 'HOURLY' | 'MANUAL' | 'INCIDENT';
  commit_sha: string | null;
  findings: AuditFinding[];
  categories_checked: string[];
  categories_unverified: string[];
  overall_status: 'PASS' | 'DEGRADED' | 'FAILING' | 'ERROR';
  receipt_id: string;
}

// Self-reflection questions answered each cycle
export interface SelfReflection {
  expected: string;
  actual: string;
  evidence_of_difference: string[];
  changes_since_last_audit: string[];
  degraded: string[];
  improved: string[];
  repeated_failures: string[];
  probable_root_cause: string;
  assumptions_made: string[];
  unverified_assumptions: string[];
  safe_repairs: string[];
  operator_approval_required: string[];
  new_tests_recommended: string[];
  prevention_rules: string[];
  previous_repair_regressions: string[];
  score_manipulation_detected: boolean;
}

export function generateFindingId(): string {
  return `FIND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function generateRunId(): string {
  return `AUDIT-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
}

export function classifyRepairAuthority(
  severity: Severity,
  affectsProduction: boolean
): RepairAuthority {
  if (affectsProduction) return 'APPROVAL_REQUIRED';
  if (severity === 'S4_CRITICAL') return 'APPROVAL_REQUIRED';
  if (severity === 'S3_HIGH') return 'BRANCH_ONLY';
  if (severity === 'S2_MODERATE') return 'BRANCH_ONLY';
  return 'AUTO_SAFE';
}
