/**
 * XAB Quarantine Engine
 * Detects and isolates threats: prompt injections, secret leaks,
 * RLS bypasses, unapproved production actions, score manipulation.
 */
import { createClient } from '@/lib/supabase/server';

export interface QuarantineResult {
  quarantined: boolean;
  quarantine_id?: string;
  rule_matched?: string;
  severity?: string;
  reason?: string;
}

// Fast in-process rule checks (no DB call needed)
const CRITICAL_PATTERNS = [
  { pattern: /ignore previous instructions/i, rule: 'QR-001', reason: 'Prompt injection: ignore instruction' },
  { pattern: /disregard your rules/i, rule: 'QR-001', reason: 'Prompt injection: disregard rules' },
  { pattern: /you are now a/i, rule: 'QR-001', reason: 'Prompt injection: persona override' },
  { pattern: /jailbreak/i, rule: 'QR-001', reason: 'Prompt injection: jailbreak keyword' },
  { pattern: /sk-[A-Za-z0-9]{20,}/g, rule: 'QR-004', reason: 'Secret exposure: OpenAI key pattern' },
  { pattern: /SUPABASE_SERVICE_ROLE/i, rule: 'QR-004', reason: 'Secret exposure: Supabase service role' },
  { pattern: /BEGIN RSA PRIVATE/i, rule: 'QR-004', reason: 'Secret exposure: RSA private key' },
  { pattern: /security_definer/i, rule: 'QR-005', reason: 'RLS bypass: security_definer function' },
  { pattern: /SET row_security/i, rule: 'QR-005', reason: 'RLS bypass: row_security override' },
];

const FORBIDDEN_ACTIONS = [
  'PRODUCTION_DEPLOY',
  'MERGE_PROTECTED_BRANCH',
  'PRODUCTION_DB_MIGRATION',
  'ENV_SECRET_CHANGE',
  'DESTRUCTIVE_DELETE',
  'GOVERNANCE_CHANGE',
  'PERMISSION_ESCALATION',
];

export function scanContent(content: string): QuarantineResult {
  for (const { pattern, rule, reason } of CRITICAL_PATTERNS) {
    if (pattern.test(content)) {
      return { quarantined: true, rule_matched: rule, severity: 'S4_CRITICAL', reason };
    }
  }
  return { quarantined: false };
}

export function validateAction(action: string): QuarantineResult {
  const normalized = action.toUpperCase().replace(/\s+/g, '_');
  for (const forbidden of FORBIDDEN_ACTIONS) {
    if (normalized.includes(forbidden)) {
      return {
        quarantined: true,
        rule_matched: 'QR-006',
        severity: 'S4_CRITICAL',
        reason: `Unapproved production action: ${action}`,
      };
    }
  }
  return { quarantined: false };
}

export async function quarantineEntity(
  entity_id: string,
  entity_type: string,
  reason: string,
  severity: string,
  detected_by: string,
  payload?: Record<string, unknown>
): Promise<string> {
  const supabase = await createClient();
  const quarantine_id = `QUAR-${entity_type.toUpperCase()}-${Date.now()}`;

  await supabase.from('quarantine').insert({
    quarantine_id,
    quarantine_type: entity_type.toUpperCase() as never,
    severity,
    reason,
    quarantined_entity_id: entity_id,
    quarantined_entity_type: entity_type,
    quarantined_payload: payload ?? {},
    detected_by_agent: detected_by,
    detection_method: 'AUTO_SCAN',
  });

  return quarantine_id;
}

export async function scanJobPayload(job_id: string, payload: Record<string, unknown>): Promise<QuarantineResult> {
  const content = JSON.stringify(payload);
  const result = scanContent(content);
  if (result.quarantined) {
    const supabase = await createClient();
    await supabase.from('ncp_job_queue').update({ status: 'QUARANTINED', updated_at: new Date().toISOString() }).eq('job_id', job_id);
    const qId = await quarantineEntity(job_id, 'JOB', result.reason!, result.severity!, 'QUARANTINE-ENGINE', payload);
    return { ...result, quarantine_id: qId };
  }
  return result;
}