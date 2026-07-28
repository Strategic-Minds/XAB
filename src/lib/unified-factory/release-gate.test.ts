import { describe, expect, it } from 'vitest';
import { evaluateRelease } from './release-gate';

describe('evaluateRelease', () => {
  it('fails when BrowserWorker or receipts are missing', () => {
    const result = evaluateRelease([], { desktop: 99, tablet: 99, mobile: 99 }, 100);
    expect(result.eligible).toBe(false);
    expect(result.missingEvidence).toContain('browserworker_health_pass');
  });

  it('fails when any breakpoint is below 99', () => {
    const result = evaluateRelease([], { desktop: 99, tablet: 98.9, mobile: 99 }, 100);
    expect(result.eligible).toBe(false);
    expect(result.failedGates).toContain('visual_parity_tablet_below_99');
  });

  it('fails when operational parity is not exactly 100', () => {
    const result = evaluateRelease([], { desktop: 99, tablet: 99, mobile: 99 }, 99.99);
    expect(result.eligible).toBe(false);
    expect(result.failedGates).toContain('operational_parity_not_100');
  });
});
