/**
 * XAB Receipt Writer
 * Every audit cycle produces tamper-evident machine-readable receipts.
 * No receipt = no completion.
 */
import crypto from 'crypto';

export interface Receipt {
  receipt_id: string;
  receipt_type: 'HEARTBEAT' | 'AUDIT' | 'FINDING' | 'REPAIR_PLAN' | 'REPAIR_ATTEMPT' | 'VALIDATION' | 'ROLLBACK' | 'FAILURE' | 'APPROVAL_REQUEST' | 'SCORE_CHANGE';
  run_id: string;
  timestamp: string;
  commit_sha: string | null;
  repo_id: string;
  repo_name: string;
  agent: string;
  previous_state: Record<string, unknown>;
  new_state: Record<string, unknown>;
  tests_executed: string[];
  results: Record<string, 'PASS' | 'FAIL' | 'SKIP' | 'ERROR'>;
  confidence: string;
  risk_class: string;
  approval_state: string;
  rollback_path: string | null;
  evidence_paths: string[];
  hash: string;
}

export function writeReceipt(
  type: Receipt['receipt_type'],
  runId: string,
  payload: Omit<Receipt, 'receipt_id' | 'receipt_type' | 'run_id' | 'timestamp' | 'hash' | 'repo_id' | 'repo_name'>
): Receipt {
  const receipt_id = `RCT-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  const receipt: Omit<Receipt, 'hash'> = {
    receipt_id,
    receipt_type: type,
    run_id: runId,
    timestamp,
    repo_id: '1297990651',
    repo_name: 'Strategic-Minds/XAB',
    ...payload,
  };
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(receipt))
    .digest('hex');
  return { ...receipt, hash };
}

export function validateReceiptChain(receipts: Receipt[]): { valid: boolean; gaps: string[] } {
  const gaps: string[] = [];
  const seen = new Set<string>();
  for (const r of receipts) {
    if (seen.has(r.receipt_id)) gaps.push(`Duplicate receipt_id: ${r.receipt_id}`);
    seen.add(r.receipt_id);
    const recomputed = crypto.createHash('sha256')
      .update(JSON.stringify({ ...r, hash: undefined }))
      .digest('hex');
    if (recomputed !== r.hash) gaps.push(`Hash mismatch on ${r.receipt_id}`);
  }
  return { valid: gaps.length === 0, gaps };
}
