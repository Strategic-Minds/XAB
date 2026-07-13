
-- ============================================================
-- APEX-20 SCHEMA MIGRATION — additive to existing XAB schema
-- Supabase project: azajysheebfhyzoyplpf
-- Generated: 2026-07-13
-- All tables prefixed apex20_ to avoid XAB conflicts
-- ============================================================

-- Enable UUID extension (already exists in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SQL-01: apex20_projects
CREATE TABLE IF NOT EXISTS apex20_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  name TEXT NOT NULL,
  description TEXT,
  brand_pack TEXT DEFAULT 'BP-01',
  ui_design TEXT DEFAULT 'UI-01',
  workflow TEXT DEFAULT 'WF-03',
  metadata JSONB DEFAULT '{}'
);

-- SQL-02: apex20_tasks
CREATE TABLE IF NOT EXISTS apex20_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES apex20_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  task_type TEXT,
  priority INTEGER DEFAULT 5,
  assigned_agent TEXT,
  description TEXT,
  result JSONB,
  metadata JSONB DEFAULT '{}'
);

-- SQL-03: apex20_agents
CREATE TABLE IF NOT EXISTS apex20_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  agent_id TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  mission TEXT,
  status TEXT DEFAULT 'active',
  model_policy TEXT DEFAULT 'router-selected',
  permissions JSONB DEFAULT '{}',
  system_prompt TEXT,
  metadata JSONB DEFAULT '{}'
);

-- SQL-04: apex20_agent_runs
CREATE TABLE IF NOT EXISTS apex20_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  task_id UUID REFERENCES apex20_tasks(id),
  status TEXT DEFAULT 'running',
  input JSONB,
  output JSONB,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error TEXT,
  metadata JSONB DEFAULT '{}'
);

-- SQL-05: apex20_work_packets
CREATE TABLE IF NOT EXISTS apex20_work_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES apex20_projects(id),
  task_id UUID REFERENCES apex20_tasks(id),
  status TEXT DEFAULT 'queued',
  packet_type TEXT,
  payload JSONB DEFAULT '{}',
  assigned_agent TEXT,
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- SQL-06: apex20_approvals
CREATE TABLE IF NOT EXISTS apex20_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES apex20_projects(id),
  approval_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_by TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  action_description TEXT,
  evidence JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- SQL-07: apex20_artifacts
CREATE TABLE IF NOT EXISTS apex20_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES apex20_projects(id),
  artifact_type TEXT NOT NULL,
  name TEXT,
  location_url TEXT,
  version TEXT DEFAULT '1.0.0',
  produced_by TEXT,
  sha256 TEXT,
  metadata JSONB DEFAULT '{}'
);

-- SQL-08: apex20_receipts
CREATE TABLE IF NOT EXISTS apex20_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  receipt_type TEXT NOT NULL,
  related_id UUID,
  action_summary TEXT,
  produced_by TEXT,
  evidence JSONB DEFAULT '{}',
  immutable BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'
);

-- SQL-09: apex20_knowledge_items
CREATE TABLE IF NOT EXISTS apex20_knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  project_id UUID REFERENCES apex20_projects(id),
  item_type TEXT,
  title TEXT,
  content TEXT,
  source TEXT,
  confidence FLOAT DEFAULT 1.0,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'
);

-- SQL-10: apex20_knowledge_edges
CREATE TABLE IF NOT EXISTS apex20_knowledge_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  from_id UUID REFERENCES apex20_knowledge_items(id) ON DELETE CASCADE,
  to_id UUID REFERENCES apex20_knowledge_items(id) ON DELETE CASCADE,
  relation_type TEXT,
  weight FLOAT DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'
);

-- SQL-11: apex20_memories
CREATE TABLE IF NOT EXISTS apex20_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  agent_id TEXT,
  project_id UUID REFERENCES apex20_projects(id),
  memory_type TEXT DEFAULT 'episodic',
  content TEXT,
  importance FLOAT DEFAULT 1.0,
  expires_at TIMESTAMPTZ,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'
);

-- SQL-12: apex20_tools
CREATE TABLE IF NOT EXISTS apex20_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  tool_id TEXT NOT NULL UNIQUE,
  tool_name TEXT NOT NULL,
  tool_type TEXT,
  status TEXT DEFAULT 'active',
  scopes JSONB DEFAULT '[]',
  schema JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- SQL-13: apex20_connectors
CREATE TABLE IF NOT EXISTS apex20_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  connector_id TEXT NOT NULL UNIQUE,
  connector_name TEXT NOT NULL,
  connector_type TEXT,
  status TEXT DEFAULT 'pending',
  scopes JSONB DEFAULT '[]',
  last_verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- SQL-14: apex20_workflows
CREATE TABLE IF NOT EXISTS apex20_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  workflow_id TEXT NOT NULL UNIQUE,
  workflow_name TEXT NOT NULL,
  workflow_type TEXT DEFAULT 'WF-03',
  status TEXT DEFAULT 'active',
  dag JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- SQL-15: apex20_workflow_runs
CREATE TABLE IF NOT EXISTS apex20_workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  workflow_id TEXT REFERENCES apex20_workflows(workflow_id),
  project_id UUID REFERENCES apex20_projects(id),
  status TEXT DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  metadata JSONB DEFAULT '{}'
);

-- SQL-16: apex20_evaluations
CREATE TABLE IF NOT EXISTS apex20_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  eval_id TEXT NOT NULL UNIQUE,
  eval_name TEXT NOT NULL,
  eval_type TEXT,
  dataset JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'
);

-- SQL-17: apex20_evaluation_runs
CREATE TABLE IF NOT EXISTS apex20_evaluation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  eval_id TEXT REFERENCES apex20_evaluations(eval_id),
  score FLOAT,
  results JSONB DEFAULT '{}',
  run_by TEXT,
  metadata JSONB DEFAULT '{}'
);

-- SQL-18: apex20_security_findings
CREATE TABLE IF NOT EXISTS apex20_security_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  finding_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  description TEXT,
  mitigation TEXT,
  detected_by TEXT,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- SQL-19: apex20_deployments
CREATE TABLE IF NOT EXISTS apex20_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  deployment_id TEXT NOT NULL UNIQUE,
  environment TEXT DEFAULT 'preview',
  status TEXT DEFAULT 'pending',
  version TEXT,
  approved_by TEXT,
  deployed_at TIMESTAMPTZ,
  rollback_ref TEXT,
  metadata JSONB DEFAULT '{}'
);

-- SQL-20: apex20_budgets
CREATE TABLE IF NOT EXISTS apex20_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL,
  budget_id TEXT NOT NULL UNIQUE,
  budget_type TEXT,
  ceiling FLOAT NOT NULL,
  spent FLOAT DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  alert_threshold FLOAT DEFAULT 0.8,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- RLS POLICIES — owner isolation on all tables
-- ============================================================
ALTER TABLE apex20_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_work_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_knowledge_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_evaluation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex20_budgets ENABLE ROW LEVEL SECURITY;

-- RLS policies (select/insert/update/delete for owner)
DO $$ 
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'apex20_projects','apex20_tasks','apex20_agents','apex20_agent_runs',
    'apex20_work_packets','apex20_approvals','apex20_artifacts','apex20_receipts',
    'apex20_knowledge_items','apex20_knowledge_edges','apex20_memories','apex20_tools',
    'apex20_connectors','apex20_workflows','apex20_workflow_runs','apex20_evaluations',
    'apex20_evaluation_runs','apex20_security_findings','apex20_deployments','apex20_budgets'
  ] LOOP
    EXECUTE format('CREATE POLICY %I_owner_select ON %I FOR SELECT USING (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY %I_owner_insert ON %I FOR INSERT WITH CHECK (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY %I_owner_update ON %I FOR UPDATE USING (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY %I_owner_delete ON %I FOR DELETE USING (owner_id = auth.uid())', t, t);
  END LOOP;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_apex20_projects_owner ON apex20_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_apex20_tasks_owner ON apex20_tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_apex20_tasks_project ON apex20_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_apex20_tasks_status ON apex20_tasks(status);
CREATE INDEX IF NOT EXISTS idx_apex20_agent_runs_agent ON apex20_agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_apex20_agent_runs_task ON apex20_agent_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_apex20_work_packets_status ON apex20_work_packets(status);
CREATE INDEX IF NOT EXISTS idx_apex20_receipts_type ON apex20_receipts(receipt_type);
CREATE INDEX IF NOT EXISTS idx_apex20_knowledge_items_owner ON apex20_knowledge_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_apex20_memories_agent ON apex20_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_apex20_security_findings_severity ON apex20_security_findings(severity, status);
