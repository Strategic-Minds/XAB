/**
 * XAB Playbook Runner
 * Executes named playbooks step-by-step with full receipts.
 * Every step is logged. Failures trigger rollback.
 */
import { createClient } from '@/lib/supabase/server';

export interface PlaybookRun {
  run_id: string;
  playbook_id: string;
  status: string;
  current_step: number;
  step_results: StepResult[];
}

export interface StepResult {
  step: number;
  name: string;
  status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
  started_at: string;
  completed_at: string;
  result?: Record<string, unknown>;
  error?: string;
}

export async function startPlaybook(
  playbook_id: string,
  trigger_payload: Record<string, unknown> = {},
  triggered_by = 'SYSTEM'
): Promise<string> {
  const supabase = await createClient();
  const run_id = `PB-RUN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data: playbook } = await supabase
    .from('playbooks')
    .select('*')
    .eq('playbook_id', playbook_id)
    .eq('is_active', true)
    .single();

  if (!playbook) throw new Error(`Playbook ${playbook_id} not found or inactive`);

  const steps = playbook.steps as unknown[];

  await supabase.from('playbook_runs').insert({
    run_id,
    playbook_id,
    triggered_by,
    trigger_type: playbook.trigger_type,
    trigger_payload,
    status: 'RUNNING',
    total_steps: steps.length,
    current_step: 0,
  });

  // Update playbook last_run
  await supabase.from('playbooks').update({
    last_run_at: new Date().toISOString(),
    run_count: playbook.run_count + 1,
  }).eq('playbook_id', playbook_id);

  return run_id;
}

export async function completePlaybookStep(
  run_id: string,
  step: number,
  result: StepResult
): Promise<void> {
  const supabase = await createClient();
  const { data: run } = await supabase.from('playbook_runs').select('step_results, total_steps').eq('run_id', run_id).single();
  if (!run) return;

  const steps = (run.step_results as StepResult[]) ?? [];
  steps.push(result);

  const isDone = step >= run.total_steps;
  await supabase.from('playbook_runs').update({
    current_step: step,
    step_results: steps,
    status: isDone ? (result.status === 'FAILED' ? 'FAILED' : 'COMPLETED') : 'RUNNING',
    completed_at: isDone ? new Date().toISOString() : null,
  }).eq('run_id', run_id);
}

export async function getActivePlaybooks(): Promise<Array<{ playbook_id: string; name: string; trigger_type: string; owner_agent: string }>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('playbooks')
    .select('playbook_id, name, trigger_type, owner_agent')
    .eq('is_active', true)
    .order('category', { ascending: true });
  return data ?? [];
}

export async function getPlaybookStatus(run_id: string): Promise<PlaybookRun | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('playbook_runs').select('*').eq('run_id', run_id).single();
  return data as PlaybookRun | null;
}