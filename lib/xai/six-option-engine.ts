/**
 * XAI Six-Option Generation Engine
 * Every selected opportunity produces exactly 6 materially different options.
 */

export type DecisionClassification = 'GO_NOW' | 'VALIDATE_FIRST' | 'HOLD' | 'DO_NOT_FUND'

export interface RevenueProjection {
  startup_cost_usd: number
  monthly_operating_cost_usd: number
  cost_per_lead_usd: number
  customer_acquisition_cost_usd: number
  average_order_value_usd: number
  gross_margin_pct: number
  net_margin_pct: number
  break_even_months: number
  time_to_first_revenue_days: number
  time_to_roi_days: number
  cash_required_usd: number
  cash_runway_months: number
  recurring_revenue_potential: 'none' | 'low' | 'medium' | 'high'
  upsell_potential: 'none' | 'low' | 'medium' | 'high'
  churn_risk: 'low' | 'medium' | 'high'
  failure_probability_pct: number
  best_case_monthly_revenue_usd: number
  base_case_monthly_revenue_usd: number
  downside_case_monthly_revenue_usd: number
  decision: DecisionClassification
  decision_rationale: string
}

export interface BusinessOption {
  option_number: 1 | 2 | 3 | 4 | 5 | 6
  option_type: 'lowest_capital' | 'fastest_revenue' | 'highest_margin' | 'strongest_recurring' | 'category_dominance' | 'evidence_based'
  business_name: string
  brand_concept: string
  logo_direction: string
  color_system: string
  typography: string
  target_buyer: string
  buyer_psychology: string
  need_or_want: 'need' | 'want' | 'both'
  primary_offer: string
  secondary_offer: string
  pricing_model: string
  funnel: string
  website_structure: string
  calls_to_action: string[]
  trust_strategy: string
  acquisition_strategy: string
  automation_strategy: string
  revenue: RevenueProjection
  human_requirements: string
  automation_potential: 'low' | 'medium' | 'high' | 'full'
  launch_sequence: string[]
  growth_sequence: string[]
  main_failure_modes: string[]
  mitigation_plan: string
}

export interface SixOptionPacket {
  opportunity_id: string
  opportunity_name: string
  category: string
  generated_at: string
  generated_by: string
  options: [BusinessOption, BusinessOption, BusinessOption, BusinessOption, BusinessOption, BusinessOption]
  recommended_option: 1 | 2 | 3 | 4 | 5 | 6
  recommendation_rationale: string
  webpack_required: boolean
  webpack_status: 'not_started' | 'in_progress' | 'approved' | 'locked'
  operator_approval_required: boolean
}

export function classifyDecision(revenue: RevenueProjection): DecisionClassification {
  if (revenue.time_to_roi_days <= 30 && revenue.failure_probability_pct < 40) return 'GO_NOW'
  if (revenue.time_to_roi_days <= 90 && revenue.failure_probability_pct < 60) return 'VALIDATE_FIRST'
  if (revenue.base_case_monthly_revenue_usd > 0 && revenue.failure_probability_pct < 80) return 'HOLD'
  return 'DO_NOT_FUND'
}

export function validateSixOptionPacket(packet: Partial<SixOptionPacket>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!packet.opportunity_id) errors.push('Missing opportunity_id')
  if (!packet.options || packet.options.length !== 6) errors.push('Must have exactly 6 options')
  if (packet.options) {
    const types = packet.options.map(o => o.option_type)
    const required: BusinessOption['option_type'][] = ['lowest_capital','fastest_revenue','highest_margin','strongest_recurring','category_dominance','evidence_based']
    required.forEach(t => { if (!types.includes(t)) errors.push(`Missing option type: ${t}`) })
  }
  if (!packet.webpack_status) errors.push('Missing webpack_status')
  return { valid: errors.length === 0, errors }
}