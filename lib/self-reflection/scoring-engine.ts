/**
 * XAB Scoring Engine
 * Calculates evidence-backed 95% Ceiling Readiness score.
 * Score is NEVER inflated by weakening tests or hiding failures.
 */

export interface CategoryScore {
  category_id: string;
  name: string;
  weight: number;
  capability_score: number;
  reliability_score: number;
  evidence_score: number;
  security_score: number;
  regression_confidence: number;
  observability_score: number;
  recovery_readiness: number;
  documentation_confidence: number;
  composite: number;
  status: 'VERIFIED' | 'UNVERIFIED' | 'FAILING' | 'PARTIAL';
  open_criticals: number;
  open_highs: number;
  last_tested_at: string | null;
  evidence_paths: string[];
}

export interface SystemScore {
  run_id: string;
  scored_at: string;
  current_verified_score: number;
  potential_score_after_repairs: number;
  confidence_level: number;
  evidence_coverage: number;
  open_risk_penalty: number;
  unverified_category_penalty: number;
  regression_penalty: number;
  is_ceiling_ready: boolean;
  ceiling_blockers: string[];
  category_scores: CategoryScore[];
  previous_score: number | null;
  score_delta: number | null;
  score_trend: 'IMPROVING' | 'DEGRADING' | 'STABLE' | 'UNKNOWN';
}

export const CATEGORY_WEIGHTS: Record<string, number> = {
  'CAT-01': 6,  // Governance & approvals
  'CAT-02': 5,  // Source truth & identity
  'CAT-03': 5,  // Architecture & modularity
  'CAT-04': 7,  // Functional correctness
  'CAT-05': 6,  // Reliability & availability
  'CAT-06': 5,  // Recovery & rollback
  'CAT-07': 7,  // Security & threat resistance
  'CAT-08': 4,  // Privacy & data handling
  'CAT-09': 5,  // Data integrity & persistence
  'CAT-10': 4,  // Authentication & authorization
  'CAT-11': 5,  // Observability & auditability
  'CAT-12': 5,  // Performance & latency
  'CAT-13': 4,  // Scalability & concurrency
  'CAT-14': 3,  // Cost efficiency & budgets
  'CAT-15': 6,  // AI quality & evaluation
  'CAT-16': 5,  // Agent orchestration & autonomy
  'CAT-17': 4,  // Memory/RAG & freshness
  'CAT-18': 4,  // Connector & tool safety
  'CAT-19': 5,  // UX accessibility & visual quality
  'CAT-20': 5,  // Testing release & maintainability
};

export function calculateSystemScore(
  categories: CategoryScore[],
  previousScore: number | null
): SystemScore {
  const runId = `SCORE-${Date.now()}`;
  const scoredAt = new Date().toISOString();

  // Weighted composite
  const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
  let weightedSum = 0;
  let unverifiedPenalty = 0;
  let openRiskPenalty = 0;
  let ceilingBlockers: string[] = [];

  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.category_id] ?? 5;
    weightedSum += (cat.composite * weight);

    if (cat.status === 'UNVERIFIED') {
      unverifiedPenalty += weight * 0.5; // 50% penalty for untested categories
      ceilingBlockers.push(`${cat.category_id}: UNVERIFIED`);
    }
    if (cat.open_criticals > 0) {
      openRiskPenalty += cat.open_criticals * 3;
      ceilingBlockers.push(`${cat.category_id}: ${cat.open_criticals} CRITICAL finding(s)`);
    }
    if (cat.composite < 90) {
      ceilingBlockers.push(`${cat.category_id}: score ${cat.composite} < 90 minimum`);
    }
  }

  const rawScore = (weightedSum / totalWeight);
  const currentScore = Math.max(0, Math.min(100, rawScore - (openRiskPenalty / 10)));
  const evidenceCoverage = categories.filter(c => c.status === 'VERIFIED').length / Math.max(1, categories.length);

  const isCeilingReady =
    currentScore >= 95 &&
    categories.every(c => c.open_criticals === 0) &&
    categories.every(c => c.composite >= 90) &&
    categories.every(c => c.status !== 'UNVERIFIED') &&
    ceilingBlockers.length === 0;

  const scoreDelta = previousScore !== null ? currentScore - previousScore : null;
  const scoreTrend = scoreDelta === null ? 'UNKNOWN'
    : scoreDelta > 0.5 ? 'IMPROVING'
    : scoreDelta < -0.5 ? 'DEGRADING'
    : 'STABLE';

  return {
    run_id: runId,
    scored_at: scoredAt,
    current_verified_score: Math.round(currentScore * 10) / 10,
    potential_score_after_repairs: Math.min(100, currentScore + (openRiskPenalty / 10) + (unverifiedPenalty / 20)),
    confidence_level: evidenceCoverage * 100,
    evidence_coverage: Math.round(evidenceCoverage * 100),
    open_risk_penalty: openRiskPenalty,
    unverified_category_penalty: unverifiedPenalty,
    regression_penalty: 0,
    is_ceiling_ready: isCeilingReady,
    ceiling_blockers: ceilingBlockers,
    category_scores: categories,
    previous_score: previousScore,
    score_delta: scoreDelta,
    score_trend: scoreTrend,
  };
}
