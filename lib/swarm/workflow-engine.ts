/**
 * XAB Workflow Engine
 * Durable multi-step workflow execution with:
 * - Idempotency (no duplicate runs)
 * - Distributed locking (no concurrent overlap)
 * - Step checkpointing (resume from failure)
 * - Circuit breakers (stop cascading failures)
 * - Full receipt trail
 */
import { createClient } from '@/lib/supabase/server';

export interface WorkflowContext {
  workflow_id: string;
  run_id: string;
  step: number;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  sandbox_id?: string;
  correlation_id: string;
}

export interface WorkflowStep {
  step: number;
  name: string;
  agent: string;
  action: string;
  timeout: number;
  on_fail?: 'stop' | 'skip' | 'rollback' | 'escalate' | 'log';
  condition?: string;
  retry_limit?: number;
}

// Circuit breaker state (in-memory per instance)
const circuitBreakers: Map<string, { failures: number; openAt: number | null }> = new Map();
const CIRCUIT_OPEN_THRESHOLD = 3;
const CIRCUIT_RESET_MS = 60_000;

export function checkCircuitBreaker(key: string): boolean {
  const state = circuitBreakers.get(key) ?? { failures: 0, openAt: null };
  if (state.openAt && Date.now() - state.openAt < CIRCUIT_RESET_MS) {
    return false; // Circuit open - reject
  }
  if (state.openAt && Date.now() - state.openAt >= CIRCUIT_RESET_MS) {
    circuitBreakers.set(key, { failures: 0, openAt: null }); // Auto-reset
  }
  return true;
}

export function recordCircuitFailure(key: string): void {
  const state = circuitBreakers.get(key) ?? { failures: 0, openAt: null };
  state.failures++;
  if (state.failures >= CIRCUIT_OPEN_THRESHOLD) {
    state.openAt = Date.now();
    console.warn(`[CIRCUIT BREAKER] Opened for ${key} after ${state.failures} failures`);
  }
  circuitBreakers.set(key, state);
}

export function resetCircuitBreaker(key: string): void {
  circuitBreakers.delete(key);
}

export async function acquireWorkflowLease(
  workflow_key: string,
  ttl_seconds = 300,
  agent_id = 'WORKFLOW-ENGINE'
): Promise<boolean> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('workflow_leases').insert({
      lease_key: workflow_key,
      acquired_at: new Date().toISOString(),
      ttl_seconds,
      acquired_by: agent_id,
    });
    return !error; // false if duplicate (already acquired)
  } catch {
    return false;
  }
}

export async function releaseWorkflowLease(workflow_key: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('workflow_leases').delete().eq('lease_key', workflow_key);
}

export async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeout_ms: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeout_ms}ms`)), timeout_ms)
    ),
  ]);
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  max_attempts = 3,
  base_delay_ms = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (attempt < max_attempts) {
        const delay = base_delay_ms * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export function generateCorrelationId(): string {
  return `CORR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}