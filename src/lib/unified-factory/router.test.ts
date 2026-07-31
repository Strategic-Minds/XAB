import { describe, expect, it } from 'vitest';
import { createUnifiedBuildPacket } from './router';

const request = {
  projectId: 'TEST-PROJECT-001',
  objective: 'Build a governed production dashboard with complete validation.',
  artifactType: 'dashboard' as const,
  mode: 'production' as const,
  targetUsers: ['operator'],
  requiredCapabilities: ['authentication', 'reporting'],
  integrations: ['github', 'vercel', 'supabase'],
  approvedVisualRefs: [],
  sourceTruthRefs: ['drive:test'],
  constraints: [],
  requestedBy: 'Jeremy Bensen',
  execute: false,
};

describe('createUnifiedBuildPacket', () => {
  it('routes every required factory lane', () => {
    const packet = createUnifiedBuildPacket(request);
    expect(packet.workPackets.map((item) => item.lane)).toEqual([
      'gpt_discovery',
      'gpt_brand_visual',
      'operator_approval',
      'base44_registry',
      'mcp_provisioning',
      'uacs_build',
      'browserworker_validation',
      'repair_loop',
      'promotion',
      'release',
    ]);
  });

  it('locks quality and promotion policy', () => {
    const packet = createUnifiedBuildPacket(request);
    expect(packet.qualityTargets.visualParityEachBreakpoint).toBe(99);
    expect(packet.qualityTargets.operationalParity).toBe(100);
    expect(packet.qualityTargets.browserWorkerRequired).toBe(true);
    expect(packet.promotionPolicy).toBe('draft_pr_only');
    expect(packet.productionPolicy).toBe('operator_approval_required');
  });
});
