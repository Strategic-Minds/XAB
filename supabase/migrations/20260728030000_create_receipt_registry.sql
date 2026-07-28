-- XAB receipt_registry bootstrap migration
-- Created by Ceiling Loop autonomous repair 2026-07-28
-- Safe to run multiple times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.receipt_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id text NOT NULL UNIQUE,
  receipt_type text NOT NULL,
  project_id text,
  agent text,
  action_summary text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  produced_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE INDEX IF NOT EXISTS receipt_registry_project_idx
  ON public.receipt_registry (project_id, produced_at DESC);

CREATE INDEX IF NOT EXISTS receipt_registry_type_idx
  ON public.receipt_registry (receipt_type, produced_at DESC);

ALTER TABLE public.receipt_registry ENABLE ROW LEVEL SECURITY;

-- Service-role can read/write all receipts
CREATE POLICY IF NOT EXISTS receipt_registry_service_role_all
  ON public.receipt_registry
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read their own project receipts
CREATE POLICY IF NOT EXISTS receipt_registry_auth_read
  ON public.receipt_registry
  FOR SELECT
  TO authenticated
  USING (true);

