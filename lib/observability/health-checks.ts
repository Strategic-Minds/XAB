/**
 * FAANG-grade health check framework
 * Modeled after Google SRE / Netflix Hystrix patterns
 */

import { logger } from './index'

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheck {
  name: string
  status: HealthStatus
  latency_ms: number
  message?: string
  metadata?: Record<string, unknown>
}

export interface SystemHealth {
  status: HealthStatus
  version: string
  uptime_s: number
  checks: HealthCheck[]
  score: number
  timestamp: string
}

const START_TIME = Date.now()

export async function runHealthChecks(
  checks: Array<() => Promise<HealthCheck>>
): Promise<SystemHealth> {
  const results = await Promise.allSettled(checks.map(fn => fn()))

  const healthChecks: HealthCheck[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      name: `check_${i}`,
      status: 'unhealthy' as HealthStatus,
      latency_ms: 0,
      message: r.reason instanceof Error ? r.reason.message : 'Check threw',
    }
  })

  const unhealthy = healthChecks.filter(c => c.status === 'unhealthy').length
  const degraded = healthChecks.filter(c => c.status === 'degraded').length
  const overall: HealthStatus = unhealthy > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : 'healthy'

  const score = Math.round(
    (healthChecks.filter(c => c.status === 'healthy').length / healthChecks.length) * 100
  )

  const systemHealth: SystemHealth = {
    status: overall,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    uptime_s: Math.round((Date.now() - START_TIME) / 1000),
    checks: healthChecks,
    score,
    timestamp: new Date().toISOString(),
  }

  logger.info({ health: systemHealth }, `System health: ${overall} (${score}/100)`)
  return systemHealth
}
