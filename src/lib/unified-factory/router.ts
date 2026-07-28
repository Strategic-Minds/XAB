import { randomUUID } from 'node:crypto';
import type { UnifiedBuildPacket, UnifiedBuildRequest, WorkPacket } from './contracts';

const PROTECTED = [
  'production_deploy',
  'merge_protected_branch',
  'production_database_migration',
  'secret_or_environment_mutation',
  'domain_or_dns_change',
  'paid_resource_creation',
  'customer_message',
  'live_publish',
  'destructive_action',
];

function packet(
  projectId: string,
  lane: WorkPacket['lane'],
  owner: WorkPacket['owner'],
  objective: string,
  requiredInputs: string[],
  requiredOutputs: string[],
  dependsOn: string[] = [],
  blocked = false,
): WorkPacket {
  return {
    packetId: `${projectId}:${lane}`,
    projectId,
    lane,
    owner,
    objective,
    requiredInputs,
    requiredOutputs,
    protectedActions: PROTECTED,
    dependsOn,
    status: blocked ? 'blocked' : dependsOn.length ? 'queued' : 'ready',
  };
}

export function createUnifiedBuildPacket(request: UnifiedBuildRequest): UnifiedBuildPacket {
  const projectId = request.projectId;
  const discovery = `${projectId}:gpt_discovery`;
  const brand = `${projectId}:gpt_brand_visual`;
  const approval = `${projectId}:operator_approval`;
  const registry = `${projectId}:base44_registry`;
  const provision = `${projectId}:mcp_provisioning`;
  const build = `${projectId}:uacs_build`;
  const validate = `${projectId}:browserworker_validation`;
  const repair = `${projectId}:repair_loop`;
  const promote = `${projectId}:promotion`;

  const workPackets: WorkPacket[] = [
    packet(projectId, 'gpt_discovery', 'GPT', 'Create a testable specification and acceptance matrix.', request.sourceTruthRefs, ['specification', 'acceptance_criteria', 'benchmark_receipt']),
    packet(projectId, 'gpt_brand_visual', 'GPT', request.approvedBrandRef ? 'Lock implementation to the approved brand and visual references.' : 'Create exactly three brand packs and exactly three web packs for operator selection.', ['specification', ...request.approvedVisualRefs], ['brand_pack', 'web_pack', 'copy_pack', 'visual_parity_rubric'], [discovery]),
    packet(projectId, 'operator_approval', 'OPERATOR', 'Approve or revise the visual and workflow direction.', ['brand_pack', 'web_pack', 'visual_parity_rubric'], ['operator_decision_receipt'], [brand], true),
    packet(projectId, 'base44_registry', 'BASE44_APEX', 'Create project, workflow, connector, artifact, validation, receipt and approval registry state.', ['specification', 'operator_decision_receipt'], ['base44_registry_ids', 'queue_records'], [approval]),
    packet(projectId, 'mcp_provisioning', 'AUTO_BUILDER_MCP', 'Provision Drive, GitHub, Vercel preview/sandbox and the approved Supabase development boundary with receipts.', ['base44_registry_ids', 'specification'], ['drive_folder', 'github_branch_or_repo', 'vercel_preview_project', 'supabase_dev_ref', 'provisioning_receipts'], [registry]),
    packet(projectId, 'uacs_build', 'BASE44_APEX', 'Execute the UACS sandbox-first build using reusable templates and branch-scoped coding agents.', ['specification', 'operator_decision_receipt', 'provisioning_receipts'], ['working_preview', 'source_commit', 'test_inventory', 'rollback_ref'], [provision]),
    packet(projectId, 'browserworker_validation', 'BROWSERWORKER', 'Validate desktop, tablet and mobile visual parity plus every applicable operational behavior.', ['working_preview', 'approved_visual_reference', 'test_inventory'], ['screenshots', 'visual_diff', 'e2e_receipt', 'console_receipt', 'network_receipt', 'accessibility_receipt'], [build]),
    packet(projectId, 'repair_loop', 'BASE44_APEX', 'Route failed evidence to the smallest responsible branch-only repair packet for at most five iterations.', ['validation_receipts'], ['repair_commits', 'retest_receipts'], [validate]),
    packet(projectId, 'promotion', 'AUTO_BUILDER_MCP', 'Create a draft promotion PR only after every mandatory gate passes.', ['all_validation_receipts', 'rollback_ref'], ['draft_pr', 'promotion_bundle'], [repair]),
    packet(projectId, 'release', 'OPERATOR', 'Approve or reject production release. Run smoke tests and rollback on failure.', ['promotion_bundle', 'draft_pr'], ['release_decision', 'production_receipt_or_rejection'], [promote], true),
  ];

  return {
    schemaVersion: '1.0.0',
    projectId,
    correlationId: randomUUID(),
    createdAt: new Date().toISOString(),
    request,
    qualityTargets: {
      visualParityEachBreakpoint: 99,
      operationalParity: 100,
      browserWorkerRequired: true,
      maxRepairIterations: 5,
    },
    resources: {
      drive: 'required',
      github: 'required',
      vercel: 'required',
      supabase: 'required_when_stateful',
      base44: 'required',
      browserworker: 'required',
      uacsSandbox: 'required',
    },
    workPackets,
    promotionPolicy: 'draft_pr_only',
    productionPolicy: 'operator_approval_required',
  };
}
