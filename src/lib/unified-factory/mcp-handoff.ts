import type { UnifiedBuildPacket } from './contracts';

export interface AutoBuilderMcpHandoff {
  tool: 'run_universal_job';
  arguments: {
    job_id: string;
    mode: 'dry_run' | 'approval_gated';
    actions: string[];
    blocked_actions: string[];
    approval_required: boolean;
    payload: UnifiedBuildPacket;
    receipt: {
      required: true;
      destinations: string[];
    };
    rollback: {
      required: true;
      strategy: string;
    };
  };
}

export function createMcpHandoff(packet: UnifiedBuildPacket): AutoBuilderMcpHandoff {
  return {
    tool: 'run_universal_job',
    arguments: {
      job_id: `${packet.projectId}:${packet.correlationId}`,
      mode: packet.request.execute ? 'approval_gated' : 'dry_run',
      actions: [
        'rehydrate_source_truth',
        'register_base44_project',
        'create_drive_project_structure',
        'create_or_prepare_github_branch_or_repo',
        'create_vercel_preview_or_sandbox',
        'prepare_supabase_development_boundary',
        'route_uacs_build_packets',
        'run_browserworker_validation',
        'run_recursive_repair_loop',
        'create_draft_promotion_pr',
        'write_sync_and_validation_receipts',
      ],
      blocked_actions: [
        'production_deploy',
        'merge_protected_branch',
        'production_database_migration',
        'secret_or_environment_mutation',
        'domain_or_dns_change',
        'paid_resource_creation',
        'customer_message',
        'live_social_publish',
        'destructive_action',
      ],
      approval_required: true,
      payload: packet,
      receipt: {
        required: true,
        destinations: ['Base44 ReceiptRegistry', 'Google Drive receipts', 'Supabase event ledger', 'GitHub PR evidence'],
      },
      rollback: {
        required: true,
        strategy: 'Revert branch commits, remove or retire preview resources, apply down migration only in the approved non-production boundary, and preserve all receipts.',
      },
    },
  };
}
