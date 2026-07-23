/**
 * XAB BrowserWorker Client — mandatory visual and operational validation.
 * Every website build must complete three independent rounds across desktop,
 * tablet, and mobile before promotion can be authorized.
 */

export interface BrowserJob {
  job_id: string
  url: string
  actions: BrowserAction[]
  options?: {
    viewport?: { width: number; height: number }
    timeout_ms?: number
  }
}

export interface BrowserAction {
  action: string
  url?: string
  selector?: string
  name?: string
  value?: string
}

export interface BrowserResult {
  ok: boolean
  job_id: string
  run_index: number
  viewport: 'desktop' | 'tablet' | 'mobile'
  status: 'completed' | 'failed' | 'timeout' | 'not_configured'
  screenshots: Screenshot[]
  console_errors: string[]
  network_errors: string[]
  links_found: string[]
  visible_text?: string
  cta_results?: CTAResult[]
  duration_ms: number
  error?: string
}

export interface Screenshot {
  name: string
  viewport: string
  data_url?: string
  url?: string
}

export interface CTAResult {
  selector: string
  visible: boolean
  clickable: boolean
  text?: string
}

export interface ValidationRound {
  run_index: number
  passed: boolean
  results: BrowserResult[]
  blockers: string[]
}

export interface ValidationSuite {
  required_rounds: number
  required_viewports: number
  pass_count: number
  fail_count: number
  rounds: ValidationRound[]
  runs: BrowserResult[]
  overall: 'PASS' | 'FAIL' | 'DEGRADED'
  mandatory_passed: boolean
}

const REQUIRED_ROUNDS = 3
const VIEWPORTS = [
  { name: 'desktop' as const, width: 1440, height: 900 },
  { name: 'tablet' as const, width: 768, height: 1024 },
  { name: 'mobile' as const, width: 390, height: 844 },
]

function failedResult(job: BrowserJob, runIndex: number, viewport: BrowserResult['viewport'], status: BrowserResult['status'], error: string, durationMs = 0): BrowserResult {
  return {
    ok: false,
    job_id: job.job_id,
    run_index: runIndex,
    viewport,
    status,
    screenshots: [],
    console_errors: status === 'not_configured' ? [error] : [],
    network_errors: [],
    links_found: [],
    duration_ms: durationMs,
    error,
  }
}

async function runJob(job: BrowserJob, runIndex: number, viewport: BrowserResult['viewport']): Promise<BrowserResult> {
  const workerUrl = process.env.BROWSER_WORKER_URL?.replace(/\/$/, '')
  const secret = process.env.BROWSER_WORKER_SECRET

  if (!workerUrl || !secret) {
    return failedResult(
      job,
      runIndex,
      viewport,
      'not_configured',
      'BrowserWorker not configured. BROWSER_WORKER_URL and BROWSER_WORKER_SECRET are required.'
    )
  }

  const start = Date.now()

  try {
    const response = await fetch(`${workerUrl}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(job.options?.timeout_ms ?? 90000),
    })

    if (!response.ok) {
      const body = await response.text()
      return failedResult(
        job,
        runIndex,
        viewport,
        'failed',
        `BrowserWorker HTTP ${response.status}: ${body.slice(0, 300)}`,
        Date.now() - start
      )
    }

    const data = await response.json() as Record<string, unknown>
    const screenshots = Array.isArray(data.screenshots) ? data.screenshots as Screenshot[] : []
    const consoleErrors = Array.isArray(data.console_errors) ? data.console_errors as string[] : []
    const networkErrors = Array.isArray(data.network_errors) ? data.network_errors as string[] : []
    const links = Array.isArray(data.links) ? data.links as string[] : []
    const ctaResults = Array.isArray(data.cta_results) ? data.cta_results as CTAResult[] : undefined
    const completed = data.status === undefined || data.status === 'completed'
    const evidenceComplete = completed && screenshots.length > 0
    const operationallyClean = consoleErrors.length === 0 && networkErrors.length === 0

    return {
      ok: Boolean(data.ok ?? true) && evidenceComplete && operationallyClean,
      job_id: job.job_id,
      run_index: runIndex,
      viewport,
      status: completed ? 'completed' : 'failed',
      screenshots,
      console_errors: consoleErrors,
      network_errors: networkErrors,
      links_found: links,
      visible_text: typeof data.visible_text === 'string' ? data.visible_text : undefined,
      cta_results: ctaResults,
      duration_ms: Date.now() - start,
      error: evidenceComplete
        ? operationallyClean
          ? undefined
          : 'BrowserWorker completed with console or network errors.'
        : 'BrowserWorker did not return completed screenshot evidence.',
    }
  } catch (error: unknown) {
    const status = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
      ? 'timeout'
      : 'failed'

    return failedResult(
      job,
      runIndex,
      viewport,
      status,
      error instanceof Error ? error.message : String(error),
      Date.now() - start
    )
  }
}

/**
 * Run three independent validation rounds. Each round tests desktop, tablet,
 * and mobile in fresh BrowserWorker jobs. All nine jobs must pass.
 */
export async function runMandatoryValidationSuite(siteUrl: string, projectId: string): Promise<ValidationSuite> {
  const rounds: ValidationRound[] = []
  const runs: BrowserResult[] = []

  for (let runIndex = 1; runIndex <= REQUIRED_ROUNDS; runIndex += 1) {
    const results: BrowserResult[] = []

    for (const viewport of VIEWPORTS) {
      const nonce = `${Date.now()}-${crypto.randomUUID()}`
      const job: BrowserJob = {
        job_id: `val-${projectId}-r${runIndex}-${viewport.name}-${nonce}`,
        url: siteUrl,
        actions: [
          { action: 'open_url', url: siteUrl },
          { action: 'wait_for_selector', selector: 'body' },
          { action: 'read_page', name: 'page_structure' },
          { action: 'extract_text', name: 'visible_text' },
          { action: 'extract_links', name: 'all_links' },
          { action: 'screenshot', name: `run_${runIndex}_${viewport.name}_home` },
          { action: 'validate_flow', name: 'console_network_and_navigation' },
        ],
        options: {
          viewport,
          timeout_ms: 90000,
        },
      }

      const result = await runJob(job, runIndex, viewport.name)
      results.push(result)
      runs.push(result)
    }

    const blockers = results.flatMap((result) => {
      const issues: string[] = []
      if (!result.ok) issues.push(`${result.viewport}: ${result.error ?? result.status}`)
      if (result.screenshots.length === 0) issues.push(`${result.viewport}: screenshot missing`)
      if (result.console_errors.length > 0) issues.push(`${result.viewport}: ${result.console_errors.length} console errors`)
      if (result.network_errors.length > 0) issues.push(`${result.viewport}: ${result.network_errors.length} network errors`)
      return issues
    })

    rounds.push({
      run_index: runIndex,
      passed: blockers.length === 0 && results.length === VIEWPORTS.length,
      results,
      blockers,
    })
  }

  const passCount = rounds.filter((round) => round.passed).length
  const failCount = REQUIRED_ROUNDS - passCount
  const mandatoryPassed = passCount === REQUIRED_ROUNDS && runs.length === REQUIRED_ROUNDS * VIEWPORTS.length

  return {
    required_rounds: REQUIRED_ROUNDS,
    required_viewports: VIEWPORTS.length,
    pass_count: passCount,
    fail_count: failCount,
    rounds,
    runs,
    overall: mandatoryPassed ? 'PASS' : passCount === 0 ? 'FAIL' : 'DEGRADED',
    mandatory_passed: mandatoryPassed,
  }
}

export async function quickHealthCheck(): Promise<{ ok: boolean; latency_ms: number; version?: string }> {
  const workerUrl = process.env.BROWSER_WORKER_URL?.replace(/\/$/, '')
  if (!workerUrl) return { ok: false, latency_ms: 0 }

  const startedAt = Date.now()

  try {
    const response = await fetch(`${workerUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    })
    const data = await response.json() as Record<string, unknown>

    return {
      ok: response.ok && data.ok !== false,
      latency_ms: Date.now() - startedAt,
      version: typeof data.worker_version === 'string' ? data.worker_version : undefined,
    }
  } catch {
    return { ok: false, latency_ms: Date.now() - startedAt }
  }
}
