/**
 * XAI Revenue Gate - enforces economic accountability
 * Every opportunity must pass before entering the build queue.
 */

import { type RevenueProjection, classifyDecision } from './six-option-engine'

export interface RevenueGateResult {
  passed: boolean
  decision: 'GO_NOW' | 'VALIDATE_FIRST' | 'HOLD' | 'DO_NOT_FUND'
  score: number
  blockers: string[]
  conditions: string[]
  evidence_labels: EvidenceLabel[]
}

export type EvidenceLabel = 'VERIFIED' | 'ESTIMATED' | 'INFERRED' | 'UNAVAILABLE' | 'REQUIRES_VALIDATION'

export interface EvidencedClaim {
  claim: string
  value: number | string | boolean
  label: EvidenceLabel
  source?: string
}

export function runRevenueGate(revenue: RevenueProjection, claims: EvidencedClaim[]): RevenueGateResult {
  const blockers: string[] = []
  const conditions: string[] = []
  let score = 100

  if (revenue.failure_probability_pct >= 80) {
    blockers.push(`Failure probability too high: ${revenue.failure_probability_pct}%`)
    score -= 40
  }
  if (revenue.net_margin_pct < 0) {
    blockers.push(`Negative net margin: ${revenue.net_margin_pct}%`)
    score -= 30
  }
  if (revenue.base_case_monthly_revenue_usd <= 0) {
    blockers.push('No credible revenue in base case')
    score -= 30
  }
  if (revenue.time_to_first_revenue_days > 180) {
    blockers.push(`Time to first revenue too long: ${revenue.time_to_first_revenue_days} days`)
    score -= 20
  }
  if (revenue.startup_cost_usd > 10000) conditions.push(`High startup cost: $${revenue.startup_cost_usd}`)
  if (revenue.customer_acquisition_cost_usd > revenue.average_order_value_usd) conditions.push('CAC exceeds AOV')
  if (revenue.churn_risk === 'high') conditions.push('High churn risk')

  const unverified = claims.filter(c => ['UNAVAILABLE','REQUIRES_VALIDATION'].includes(c.label))
  if (unverified.length > claims.length * 0.5) {
    conditions.push(`${unverified.length}/${claims.length} claims require validation`)
    score -= 10
  }

  const decision = classifyDecision(revenue)
  const passed = blockers.length === 0 && (decision === 'GO_NOW' || decision === 'VALIDATE_FIRST')

  return {
    passed,
    decision,
    score: Math.max(0, score),
    blockers,
    conditions,
    evidence_labels: claims.map(c => c.label)
  }
}