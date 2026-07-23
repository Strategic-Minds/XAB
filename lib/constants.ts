/**
 * XAB System Constants — single source of truth
 * Never use magic strings in code — import from here
 */

export const XAB_VERSION = '2.0.0'
export const XAB_SYSTEM_NAME = 'XAB'

// Scoring thresholds
export const SCORE_ELITE = 95
export const SCORE_PRODUCTION_READY = 80
export const SCORE_DEGRADED = 60
export const SCORE_CRITICAL = 40

// Timing constants
export const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000    // 5 minutes
export const OVERNIGHT_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 hours
export const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000    // 6 hours

// BrowserWorker
export const BW_MANDATORY_PASS_COUNT = 3
export const BW_TIMEOUT_MS = 60_000
export const BW_VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

// API rate limits
export const RATE_LIMIT_API_DEFAULT = 60      // per minute
export const RATE_LIMIT_AI_ROUTES = 10        // per minute (expensive)
export const RATE_LIMIT_AUTH_ROUTES = 5       // per minute (security)

// Kill switches
export const KILL_SWITCH_IDS = ['KS-001', 'KS-002', 'KS-003', 'KS-004'] as const
export type KillSwitchId = typeof KILL_SWITCH_IDS[number]

// Governance
export const GOVERNANCE_LEVEL = 5
export const PROTECTED_ACTIONS = [
  'APPROVE_MERGE_TO_MAIN',
  'APPROVE_PRODUCTION_DEPLOY',
  'APPROVE_SUPABASE_MIGRATION',
  'APPROVE_SECRET_ROTATION',
  'APPROVE_BILLING_CHANGE',
] as const
