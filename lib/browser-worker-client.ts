/**
 * XAB BrowserWorker Client — MANDATORY visual validation layer
 * Every website build MUST pass 3 BrowserWorker runs before promotion.
 * Zero tolerance for skipping this layer.
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

export interface ValidationSuite {
  pass_count: number
  fail_count: number
  runs: BrowserResult[]
  overall: 'PASS' | 'FAIL' | 'DEGRADED'
  mandatory_passed: boolean // Must be true before promotion
}

const MANDATORY_PASS_COUNT = 3

async function runJob(job: BrowserJob): Promise<BrowserResult> {
  const url = process.env.BROWSER_WORKER_URL
  const secret = process.env.BROWSER_WORKER_SECRET

  if (!url || !secret) {
    return {
      ok: false,
      job_id: job.job_id,
      status: 'not_configured',
      screenshots: [],
      console_errors: ['BrowserWorker not configured — BROWSER_WORKER_URL and BROWSER_WORKER_SECRET required'],
      network_errors: [],
      links_found: [],
      duration_ms: 0,
      error: 'BrowserWorker not configured. Set BROWSER_WORKER_URL and BROWSER_WORKER_SECRET.',
    }
  }

  const start = Date.now()
  try {
    const res = await fetch(`${url}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(job.options?.timeout_ms ?? 60000),
    })

    if (!res.ok) {
      const text = await res.text()
      return {
        ok: false,
        job_id: job.job_id,
        status: 'failed',
        screenshots: [],
        console_errors: [],
        network_errors: [],
        links_found: [],
        duration_ms: Date.now() - start,
        error: `BrowserWorker HTTP ${res.status}: ${text.slice(0, 200)}`,
      }
    }

    const data = await res.json()
    return {
      ok: true,
      job_id: job.job_id,
      status: 'completed',
      screenshots: data.screenshots ?? [],
      console_errors: data.console_errors ?? [],
      network_errors: data.network_errors ?? [],
      links_found: data.links ?? [],
      visible_text: data.visible_text,
      cta_results: data.cta_results,
      duration_ms: Date.now() - start,
    }
  } catch (e: unknown) {
    return {
      ok: false,
      job_id: job.job_id,
      status: e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'failed',
      screenshots: [],
      console_errors: [],
      network_errors: [],
      links_found: [],
      duration_ms: Date.now() - start,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * Run mandatory 3-pass validation suite for a website.
 * ALL 3 passes must succeed for mandatory_passed = true.
 * NEVER promote a website without mandatory_passed = true.
 */
export async function runMandatoryValidationSuite(
  siteUrl: string,
  projectId: string
): Promise<ValidationSuite> {
  const viewports = [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
  ]

  const runs: BrowserResult[] = []

  for (let i = 0; i < MANDATORY_PASS_COUNT; i++) {
    const viewport = viewports[i]
    const job: BrowserJob = {
      job_id: `val-${projectId}-${viewport.name}-${Date.now()}`,
      url: siteUrl,
      actions: [
        { action: 'goto', url: siteUrl },
        { action: 'screenshot', name: `${viewport.name}_home` },
        { action: 'extract_text', name: 'visible_text' },
        { action: 'extract_links', name: 'all_links' },
      ],
      options: { viewport, timeout_ms: 45000 },
    }
    const result = await runJob(job)
    runs.push(result)
  }

  const pass_count = runs.filter(r => r.ok).length
  const fail_count = runs.filter(r => !r.ok).length
  const mandatory_passed = pass_count >= MANDATORY_PASS_COUNT

  return {
    pass_count,
    fail_count,
    runs,
    overall: mandatory_passed ? 'PASS' : fail_count === MANDATORY_PASS_COUNT ? 'FAIL' : 'DEGRADED',
    mandatory_passed,
  }
}

/**
 * Quick health check for use in heartbeat
 */
export async function quickHealthCheck(): Promise<{ ok: boolean; latency_ms: number; version?: string }> {
  const url = process.env.BROWSER_WORKER_URL
  const secret = process.env.BROWSER_WORKER_SECRET
  if (!url || !secret) return { ok: false, latency_ms: 0 }
  const t = Date.now()
  try {
    const res = await fetch(`${url}/api/health`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    return { ok: res.ok, latency_ms: Date.now() - t, version: data.worker_version }
  } catch {
    return { ok: false, latency_ms: Date.now() - t }
  }
}
