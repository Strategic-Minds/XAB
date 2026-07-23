/**
 * XAB Pipeline Gates — titanium enforcement layer.
 * No website passes without complete measurable evidence.
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

function addGate(gates: PipelineGateResult[], blockers: string[], gate: PipelineGateResult): void {
  gates.push(gate)
  if (!gate.passed && gate.blocked_reason) blockers.push(gate.blocked_reason)
}

export async function runFullPipelineGates(projectId: string, siteUrl: string): Promise<PipelineReport> {
  const gates: PipelineGateResult[] = []
  const blockers: string[] = []
  let browserValidation: ValidationSuite | null = null

  try {
    browserValidation = await runMandatoryValidationSuite(siteUrl, projectId)
    const requiredRounds = browserValidation.required_rounds

    addGate(gates, blockers, {
      gate: 'BROWSERWORKER_3_INDEPENDENT_ROUNDS',
      passed: browserValidation.mandatory_passed,
      score: Math.round((browserValidation.pass_count / requiredRounds) * 100),
      evidence: `${browserValidation.pass_count}/${requiredRounds} complete rounds passed across ${browserValidation.required_viewports} viewports per round.`,
      blocked_reason: browserValidation.mandatory_passed
        ? undefined
        : `BrowserWorker validation failed: ${browserValidation.fail_count} required rounds did not pass.`,
    })
  } catch (error: unknown) {
    addGate(gates, blockers, {
      gate: 'BROWSERWORKER_3_INDEPENDENT_ROUNDS',
      passed: false,
      score: 0,
      evidence: 'BrowserWorker validation threw an exception.',
      blocked_reason: `BrowserWorker exception: ${error instanceof Error ? error.message : String(error)}`,
    })
  }

  try {
    const response = await fetch(siteUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'XAB-Titanium-Gate/1.0' },
    })

    addGate(gates, blockers, {
      gate: 'SITE_REACHABLE',
      passed: response.ok,
      score: response.ok ? 100 : 0,
      evidence: `HTTP ${response.status}; final URL: ${response.url}`,
      blocked_reason: response.ok ? undefined : `Site returned HTTP ${response.status}.`,
    })
  } catch (error: unknown) {
    addGate(gates, blockers, {
      gate: 'SITE_REACHABLE',
      passed: false,
      score: 0,
      evidence: 'Direct site fetch failed.',
      blocked_reason: `Site unreachable: ${error instanceof Error ? error.message : String(error)}`,
    })
  }

  if (browserValidation) {
    const consoleErrors = browserValidation.runs.flatMap((run) => run.console_errors)
    const networkErrors = browserValidation.runs.flatMap((run) => run.network_errors)
    const missingScreenshots = browserValidation.runs.filter((run) => run.screenshots.length === 0)
    const incompleteRuns = browserValidation.runs.filter((run) => run.status !== 'completed')
    const expectedJobs = browserValidation.required_rounds * browserValidation.required_viewports

    addGate(gates, blockers, {
      gate: 'ALL_BROWSER_JOBS_COMPLETED',
      passed: browserValidation.runs.length === expectedJobs && incompleteRuns.length === 0,
      score: browserValidation.runs.length === 0
        ? 0
        : Math.round(((browserValidation.runs.length - incompleteRuns.length) / expectedJobs) * 100),
      evidence: `${browserValidation.runs.length}/${expectedJobs} jobs returned; ${incompleteRuns.length} incomplete.`,
      blocked_reason: incompleteRuns.length === 0 && browserValidation.runs.length === expectedJobs
        ? undefined
        : 'One or more required BrowserWorker jobs were missing or incomplete.',
    })

    addGate(gates, blockers, {
      gate: 'SCREENSHOT_EVIDENCE_COMPLETE',
      passed: missingScreenshots.length === 0 && browserValidation.runs.length === expectedJobs,
      score: browserValidation.runs.length === 0
        ? 0
        : Math.round(((browserValidation.runs.length - missingScreenshots.length) / expectedJobs) * 100),
      evidence: `${missingScreenshots.length} required jobs are missing screenshot evidence.`,
      blocked_reason: missingScreenshots.length === 0 ? undefined : 'Required desktop, tablet, or mobile screenshot evidence is missing.',
    })

    addGate(gates, blockers, {
      gate: 'ZERO_CONSOLE_ERRORS',
      passed: consoleErrors.length === 0,
      score: consoleErrors.length === 0 ? 100 : 0,
      evidence: `${consoleErrors.length} console errors captured across all validation jobs.`,
      blocked_reason: consoleErrors.length === 0 ? undefined : `${consoleErrors.length} console errors block promotion.`,
    })

    addGate(gates, blockers, {
      gate: 'ZERO_NETWORK_ERRORS',
      passed: networkErrors.length === 0,
      score: networkErrors.length === 0 ? 100 : 0,
      evidence: `${networkErrors.length} network errors captured across all validation jobs.`,
      blocked_reason: networkErrors.length === 0 ? undefined : `${networkErrors.length} network errors block promotion.`,
    })
  } else {
    for (const gateName of ['ALL_BROWSER_JOBS_COMPLETED', 'SCREENSHOT_EVIDENCE_COMPLETE', 'ZERO_CONSOLE_ERRORS', 'ZERO_NETWORK_ERRORS']) {
      addGate(gates, blockers, {
        gate: gateName,
        passed: false,
        score: 0,
        evidence: 'No BrowserWorker validation suite was returned.',
        blocked_reason: `${gateName} cannot pass without BrowserWorker evidence.`,
      })
    }
  }

  const totalScore = gates.length > 0
    ? Math.round(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length)
    : 0
  const promotionAuthorized = gates.length > 0 && gates.every((gate) => gate.passed) && blockers.length === 0

  return {
    project_id: projectId,
    site_url: siteUrl,
    timestamp: new Date().toISOString(),
    overall: promotionAuthorized ? 'PASS' : 'BLOCKED',
    score: totalScore,
    gates,
    browser_validation: browserValidation,
    promotion_authorized: promotionAuthorized,
    blockers: [...new Set(blockers)],
  }
}
