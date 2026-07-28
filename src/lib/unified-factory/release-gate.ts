import type { GateEvidence, ReleaseEvaluation } from './contracts';

const MANDATORY_GATES = [
  'specification_testable',
  'operator_visual_approval',
  'feature_branch_only',
  'draft_pull_request',
  'build_pass',
  'typecheck_pass',
  'lint_pass',
  'unit_tests_pass',
  'integration_tests_pass',
  'browserworker_health_pass',
  'browserworker_desktop_pass',
  'browserworker_tablet_pass',
  'browserworker_mobile_pass',
  'visual_parity_pass',
  'operational_parity_pass',
  'accessibility_pass',
  'security_scan_pass',
  'secrets_scan_pass',
  'performance_budget_pass',
  'zero_console_errors',
  'zero_unexpected_network_errors',
  'receipt_bundle_complete',
  'rollback_reference_exists',
  'preview_smoke_pass',
] as const;

export function evaluateRelease(
  evidence: GateEvidence[],
  visualParity: ReleaseEvaluation['visualParity'],
  operationalParity: number,
): ReleaseEvaluation {
  const byGate = new Map(evidence.map((item) => [item.gate, item]));
  const failedGates: string[] = [];
  const blockedGates: string[] = [];
  const missingEvidence: string[] = [];

  for (const gate of MANDATORY_GATES) {
    const item = byGate.get(gate);
    if (!item) {
      missingEvidence.push(gate);
      continue;
    }
    if (item.status === 'fail') failedGates.push(gate);
    if (item.status === 'blocked') blockedGates.push(gate);
    if (item.status === 'pass' && !item.receiptUrl) missingEvidence.push(`${gate}:receipt`);
  }

  if (visualParity.desktop < 99) failedGates.push('visual_parity_desktop_below_99');
  if (visualParity.tablet < 99) failedGates.push('visual_parity_tablet_below_99');
  if (visualParity.mobile < 99) failedGates.push('visual_parity_mobile_below_99');
  if (operationalParity !== 100) failedGates.push('operational_parity_not_100');

  return {
    eligible: failedGates.length === 0 && blockedGates.length === 0 && missingEvidence.length === 0,
    visualParity,
    operationalParity,
    failedGates: [...new Set(failedGates)],
    blockedGates: [...new Set(blockedGates)],
    missingEvidence: [...new Set(missingEvidence)],
  };
}
