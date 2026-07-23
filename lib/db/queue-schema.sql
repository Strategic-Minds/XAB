-- XAI Titanium Queue Schema
-- Version: 1.0.0
-- Date: 2026-07-23

-- ─── JOB QUEUE TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xai_job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  opportunity_id TEXT,
  parent_project_id TEXT,
  job_type TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('product','service','build','validation','repair','release','monitoring','recovery')),
  category TEXT,
  subcategory TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','claimed','running','completed','failed','dead_letter','recovering','cancelled')),
  assigned_agent TEXT,
  lock_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_checksum TEXT,
  output_checksum TEXT,
  approval_status TEXT DEFAULT 'not_required' CHECK (approval_status IN ('not_required','pending','approved','rejected')),
  cost_estimate_usd NUMERIC(10,4),
  actual_cost_usd NUMERIC(10,4),
  expected_roi_usd NUMERIC(10,2),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  evidence_refs JSONB DEFAULT '[]',
  rollback_ref TEXT,
  failure_classification TEXT,
  failure_message TEXT,
  next_eligible_action TEXT,
  payload JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  sandbox_mode BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_xai_job_queue_state ON xai_job_queue(state);
CREATE INDEX IF NOT EXISTS idx_xai_job_queue_priority ON xai_job_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_xai_job_queue_lease ON xai_job_queue(lease_expires_at) WHERE state = 'claimed';
CREATE INDEX IF NOT EXISTS idx_xai_job_queue_job_id ON xai_job_queue(job_id);

-- RLS
ALTER TABLE xai_job_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY xai_job_queue_service_role ON xai_job_queue TO service_role USING (true);

-- ─── RECEIPT TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xai_receipt_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id TEXT UNIQUE NOT NULL,
  receipt_type TEXT NOT NULL,
  job_id TEXT REFERENCES xai_job_queue(job_id),
  related_project_id TEXT,
  agent TEXT,
  action_summary TEXT NOT NULL,
  verified JSONB DEFAULT '[]',
  inferred JSONB DEFAULT '[]',
  could_not_verify JSONB DEFAULT '[]',
  blockers JSONB DEFAULT '[]',
  workarounds JSONB DEFAULT '[]',
  evidence_refs JSONB DEFAULT '[]',
  rollback_procedure TEXT,
  next_actions JSONB DEFAULT '[]',
  cost_usd NUMERIC(10,4),
  commit_sha TEXT,
  deployment_id TEXT,
  browser_worker_receipt JSONB,
  screenshot_urls JSONB DEFAULT '[]',
  produced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sandbox_mode BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_xai_receipt_log_type ON xai_receipt_log(receipt_type);
CREATE INDEX IF NOT EXISTS idx_xai_receipt_log_job ON xai_receipt_log(job_id);

ALTER TABLE xai_receipt_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY xai_receipt_log_service_role ON xai_receipt_log TO service_role USING (true);

-- ─── APPROVAL TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xai_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id TEXT UNIQUE NOT NULL,
  job_id TEXT REFERENCES xai_job_queue(job_id),
  approval_type TEXT NOT NULL CHECK (approval_type IN ('production_deploy','pr_merge','secret_change','domain_change','billing_change','migration','customer_contact','destructive_action','release')),
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  evidence_packet JSONB DEFAULT '{}',
  rollback_plan TEXT,
  cost_impact_usd NUMERIC(10,2),
  risk_level TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  decided_at TIMESTAMPTZ,
  decided_by TEXT,
  decision_notes TEXT
);

ALTER TABLE xai_approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY xai_approval_service_role ON xai_approval_queue TO service_role USING (true);

-- ─── COST TRACKING TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xai_cost_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  job_id TEXT,
  agent TEXT,
  provider TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  estimated_usd NUMERIC(10,4),
  actual_usd NUMERIC(10,4),
  tokens_used INTEGER,
  browser_minutes NUMERIC(6,2),
  build_minutes NUMERIC(6,2),
  storage_gb NUMERIC(8,4),
  retry_cost_usd NUMERIC(10,4),
  revenue_attribution_usd NUMERIC(10,2),
  roi_attribution_usd NUMERIC(10,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sandbox_mode BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE xai_cost_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY xai_cost_log_service_role ON xai_cost_log TO service_role USING (true);

-- ─── INCIDENT TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xai_incident_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('sev1_critical','sev2_high','sev3_medium','sev4_low')),
  detection_source TEXT NOT NULL,
  affected_systems JSONB DEFAULT '[]',
  user_impact TEXT,
  containment_action TEXT,
  root_cause TEXT,
  repair_applied TEXT,
  validation_result TEXT,
  rollback_executed BOOLEAN DEFAULT false,
  recovery_time_minutes INTEGER,
  prevention_action TEXT,
  owner TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','contained','resolved','post_mortem')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closure_receipt TEXT
);

ALTER TABLE xai_incident_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY xai_incident_service_role ON xai_incident_log TO service_role USING (true);