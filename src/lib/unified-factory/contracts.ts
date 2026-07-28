import { z } from 'zod';

export const BuildModeSchema = z.enum(['mvp', 'production', 'enterprise']);
export type BuildMode = z.infer<typeof BuildModeSchema>;

export const ArtifactTypeSchema = z.enum([
  'website',
  'web_app',
  'mobile_pwa',
  'dashboard',
  'full_stack_system',
  'ai_agent',
  'agent_swarm',
  'workflow',
  'automation',
  'api',
  'data_system',
  'internal_tool',
]);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const UnifiedBuildRequestSchema = z.object({
  projectId: z.string().min(3),
  objective: z.string().min(10),
  artifactType: ArtifactTypeSchema,
  mode: BuildModeSchema,
  businessName: z.string().min(1).optional(),
  targetUsers: z.array(z.string().min(1)).default([]),
  requiredCapabilities: z.array(z.string().min(1)).default([]),
  integrations: z.array(z.string().min(1)).default([]),
  approvedIdeaRef: z.string().min(1).optional(),
  approvedLogoRef: z.string().min(1).optional(),
  approvedBrandRef: z.string().min(1).optional(),
  approvedVisualRefs: z.array(z.string().min(1)).default([]),
  approvedWorkflowRef: z.string().min(1).optional(),
  approvalManifestSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  existingRepo: z.string().optional(),
  sourceTruthRefs: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
  requestedBy: z.string().default('Jeremy Bensen'),
  execute: z.boolean().default(false),
}).superRefine((request, context) => {
  if (!request.execute) return;
  const required = [
    ['approvedIdeaRef', request.approvedIdeaRef],
    ['approvedLogoRef', request.approvedLogoRef],
    ['approvedBrandRef', request.approvedBrandRef],
    ['approvedWorkflowRef', request.approvedWorkflowRef],
    ['approvalManifestSha256', request.approvalManifestSha256],
  ] as const;
  for (const [field, value] of required) {
    if (!value) context.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: `${field} is required when execute=true` });
  }
  if (request.approvedVisualRefs.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['approvedVisualRefs'], message: 'At least one approved visual reference is required when execute=true' });
  }
  if (request.sourceTruthRefs.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sourceTruthRefs'], message: 'At least one source-truth reference is required when execute=true' });
  }
});

export type UnifiedBuildRequest = z.infer<typeof UnifiedBuildRequestSchema>;

export type FactoryLane =
  | 'gpt_discovery'
  | 'gpt_brand_visual'
  | 'operator_approval'
  | 'base44_registry'
  | 'mcp_provisioning'
  | 'uacs_build'
  | 'browserworker_validation'
  | 'repair_loop'
  | 'promotion'
  | 'release';

export interface WorkPacket {
  packetId: string;
  projectId: string;
  lane: FactoryLane;
  owner: 'GPT' | 'BASE44_APEX' | 'AUTO_BUILDER_MCP' | 'BROWSERWORKER' | 'OPERATOR';
  objective: string;
  requiredInputs: string[];
  requiredOutputs: string[];
  protectedActions: string[];
  dependsOn: string[];
  status: 'queued' | 'blocked' | 'ready';
}

export interface UnifiedBuildPacket {
  schemaVersion: '1.0.0';
  projectId: string;
  correlationId: string;
  createdAt: string;
  request: UnifiedBuildRequest;
  qualityTargets: {
    visualParityEachBreakpoint: 99;
    operationalParity: 100;
    browserWorkerRequired: true;
    maxRepairIterations: 5;
  };
  resources: {
    drive: 'required';
    github: 'required';
    vercel: 'required';
    supabase: 'required_when_stateful';
    base44: 'required';
    browserworker: 'required';
    uacsSandbox: 'required';
  };
  workPackets: WorkPacket[];
  promotionPolicy: 'draft_pr_only';
  productionPolicy: 'operator_approval_required';
}

export interface GateEvidence {
  gate: string;
  status: 'pass' | 'fail' | 'blocked' | 'not_applicable';
  receiptUrl?: string;
  score?: number;
  details?: string;
}

export interface ReleaseEvaluation {
  eligible: boolean;
  visualParity: Record<'desktop' | 'tablet' | 'mobile', number>;
  operationalParity: number;
  failedGates: string[];
  blockedGates: string[];
  missingEvidence: string[];
}
