/**
 * XAB Pipeline Gates — Titanium enforcement layer
 * No website passes without ALL gates satisfied.
 */

import { runMandatoryValidationSuite, type ValidationSuite } from './browser-worker-client'

export interface PipelineGateResult {
  gate: string
  passed: boolean
  score: number
  evidence: string
  blocked_reason?: string
}

export interface PipelineReport {
  project_id: string
  site_url: string
  timestamp: string
  overall: 'PASS' | 'FAIL' | 'BLOCKED'
  score: number
  gates: PipelineGateResult[]
  browser_validation: ValidationSuite | null
  promotion_authorized: boolean
  blockers: string[]
}

export async function runFullPipelineGates(
  projectId: string,
  siteUrl: string
): Promise<PipelineReport> {
  const gates: PipelineGateResult[] = []
  const blockers: string[] = []

  // GATE 1: BrowserWorker mandatory 3-pass
  let browserValidation: ValidationSuite | null = null
  try {
    browserValidation = await runMandatoryValidationSuite(siteUrl, projectId)
    const bwGate: PipelineGateResult = {
      gate: 'BROWSERWORKER_3PASS',
      passed: browserValidation.mandatory_passed,
      score: browserValidation.mandatory_passed ? 100 : (browserValidation.pass_count / 3) * 100,
      evidence: `${browserValidation.pass_count}/3 passes completed. Overall: ${browserValidation.overall}`,
    }
    if (!bwGate.passed) {
      bwGate.blocked_reason = 'BrowserWorker 3-pass mandatory validation failed. Zero tolerance.'
      blockers.push(bwGate.blocked_reason)
    }
    gates.push(bwGate)
  } catch (e) {
    const errGate: PipelineGateResult = {
      gate: 'BROWSERWORKER_3PASS',
      passed: false,
      score: 0,
      evidence: 'BrowserWorker validation threw an exception',
      blocked_reason: `BrowserWorker exception: ${e instanceof Error ? e.message : String(e)}`,
    }
    blockers.push(errGate.blocked_reason!)
    gates.push(errGate)
  }

  // GATE 2: URL reachable (HTTP 200)
  try {
    const res = await fetch(siteUrl, { signal: AbortSignal.timeout(10000) })
    gates.push({
      gate: 'SITE_REACHABLE',
      passed: res.ok,
      score: res.ok ? 100 : 0,
      evidence: `HTTP ${res.status}`,
      blocked_reason: res.ok ? undefined : `Site returned HTTP ${res.status}`,
    })
    if (!res.ok) blockers.push(`Site HTTP ${res.status}`)
  } catch (e) {
    const g: PipelineGateResult = {
      gate: 'SITE_REACHABLE',
      passed: false,
      score: 0,
      evidence: 'Fetch failed',
      blocked_reason: `Site unreachable: ${e instanceof Error ? e.message : String(e)}`,
    }
    gates.push(g)
    blockers.push(g.blocked_reason!)
  }

  // GATE 3: No console errors in BrowserWorker runs
  if (browserValidation) {
    const allErrors = browserValidation.runs.flatMap(r => r.console_errors)
    const criticalErrors = allErrors.filter(e =>
      /error|exception|undefined|null/i.test(e)
    )
    gates.push({
      gate: 'NO_CONSOLE_ERRORS',
      passed: criticalErrors.length === 0,
      score: criticalErrors.length === 0 ? 100 : Math.max(0, 100 - criticalErrors.length * 10),
      evidence: `${criticalErrors.length} critical console errors found`,
      blocked_reason: criticalErrors.length > 0 ? `${criticalErrors.length} console errors detected` : undefined,
    })
    if (criticalErrors.length > 0) blockers.push(`${criticalErrors.length} console errors`)
  }

  const totalScore = gates.length > 0
    ? Math.round(gates.reduce((sum, g) => sum + g.score, 0) / gates.length)
    : 0

  const allPassed = gates.every(g => g.passed)
  const promotion_authorized = allPassed && blockers.length === 0

  return {
    project_id: projectId,
    site_url: siteUrl,
    timestamp: new Date().toISOString(),
    overall: promotion_authorized ? 'PASS' : blockers.length > 0 ? 'BLOCKED' : 'FAIL',
    score: totalScore,
    gates,
    browser_validation: browserValidation,
    promotion_authorized,
    blockers,
  }
}
