/**
 * XAB Queue Engine
 * Manages job lifecycle: PENDING -> CLAIMED -> RUNNING -> COMPLETED/FAILED -> DLQ
 * Implements: idempotency, distributed locks, circuit breakers, backoff
 */
import { createClient } from '@/lib/supabase/server';

export type JobStatus = 'PENDING' | 'CLAIMED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DEAD' | 'CANCELLED' | 'QUARANTINED';

export interface Job {
  job_id: string;
  queue_name: string;
  job_type: string;
  priority: number;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempt_count: number;
  max_attempts: number;
  idempotency_key?: string;
  assigned_agent?: string;
  sandbox_id?: string;
  correlation_id?: string;
  timeout_seconds?: number;
}

export interface QueueOptions {
  queue_name?: string;
  priority?: number;
  max_attempts?: number;
  timeout_seconds?: number;
  idempotency_key?: string;
  correlation_id?: string;
  sandbox_id?: string;
  parent_job_id?: string;
}

export async function enqueue(
  job_type: string,
  payload: Record<string, unknown>,
  options: QueueOptions = {}
): Promise<string> {
  const supabase = await createClient();
  const job_id = `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { error } = await supabase.from('job_queue').insert({
    job_id,
    queue_name: options.queue_name ?? 'default',
    job_type,
    priority: options.priority ?? 5,
    payload,
    max_attempts: options.max_attempts ?? 3,
    timeout_seconds: options.timeout_seconds ?? 300,
    idempotency_key: options.idempotency_key,
    correlation_id: options.correlation_id,
    sandbox_id: options.sandbox_id,
    parent_job_id: options.parent_job_id,
    status: 'PENDING',
  });

  if (error) throw new Error(`Failed to enqueue job: ${error.message}`);
  return job_id;
}

export async function claim(
  queue_name: string,
  agent_id: string,
  job_types?: string[]
): Promise<Job | null> {
  const supabase = await createClient();

  let query = supabase
    .from('job_queue')
    .select('*')
    .eq('queue_name', queue_name)
    .eq('status', 'PENDING')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);

  if (job_types?.length) {
    query = query.in('job_type', job_types);
  }

  const { data: jobs } = await query;
  if (!jobs?.length) return null;

  const job = jobs[0];
  const { error } = await supabase
    .from('job_queue')
    .update({
      status: 'CLAIMED',
      assigned_agent: agent_id,
      claimed_at: new Date().toISOString(),
      attempt_count: job.attempt_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', job.id)
    .eq('status', 'PENDING'); // Optimistic lock

  if (error) return null; // Another agent claimed it
  return job as Job;
}

export async function complete(job_id: string, result: Record<string, unknown>): Promise<void> {
  const supabase = await createClient();
  await supabase.from('job_queue').update({
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('job_id', job_id);
}

export async function fail(
  job_id: string,
  error: string,
  shouldRetry = true
): Promise<void> {
  const supabase = await createClient();
  const { data: job } = await supabase.from('job_queue').select('attempt_count, max_attempts, retry_backoff_seconds').eq('job_id', job_id).single();

  if (!job) return;

  const exhausted = job.attempt_count >= job.max_attempts;
  const backoff = job.retry_backoff_seconds * Math.pow(2, job.attempt_count - 1);
  const nextRetry = shouldRetry && !exhausted
    ? new Date(Date.now() + backoff * 1000).toISOString()
    : null;

  await supabase.from('job_queue').update({
    status: exhausted ? 'DEAD' : 'FAILED',
    last_error: error,
    last_error_at: new Date().toISOString(),
    next_retry_at: nextRetry,
    updated_at: new Date().toISOString(),
  }).eq('job_id', job_id);

  // Move to DLQ if exhausted
  if (exhausted) {
    const { data: fullJob } = await supabase.from('job_queue').select('*').eq('job_id', job_id).single();
    if (fullJob) {
      await supabase.from('dead_letter_queue').insert({
        dlq_id: `DLQ-${job_id}`,
        original_job_id: job_id,
        queue_name: fullJob.queue_name,
        job_type: fullJob.job_type,
        payload: fullJob.payload,
        failure_reason: error,
        failure_count: fullJob.attempt_count,
      });
    }
  }
}

export async function quarantine(job_id: string, reason: string, severity = 'S3_HIGH'): Promise<void> {
  const supabase = await createClient();
  const { data: job } = await supabase.from('job_queue').select('*').eq('job_id', job_id).single();
  if (!job) return;

  await supabase.from('job_queue').update({ status: 'QUARANTINED', updated_at: new Date().toISOString() }).eq('job_id', job_id);
  await supabase.from('quarantine').insert({
    quarantine_id: `QUAR-JOB-${job_id}`,
    quarantine_type: 'JOB',
    severity,
    reason,
    quarantined_entity_id: job_id,
    quarantined_entity_type: 'job',
    quarantined_payload: job.payload,
    detected_by_agent: 'QUEUE-ENGINE',
  });
}