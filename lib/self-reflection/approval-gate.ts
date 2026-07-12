/**
 * XAB Approval Gate
 * Protected actions ALWAYS require operator approval.
 * The engine cannot approve its own protected actions.
 */

export type ProtectedAction =
  | 'PRODUCTION_DEPLOY'
  | 'MERGE_PROTECTED_BRANCH'
  | 'PRODUCTION_DB_MIGRATION'
  | 'ENV_SECRET_CHANGE'
  | 'DNS_DOMAIN_CHANGE'
  | 'PAID_RESOURCE_CREATE'
  | 'CUSTOMER_COMMUNICATION'
  | 'DESTRUCTIVE_DELETE'
  | 'GOVERNANCE_CHANGE'
  | 'PERMISSION_ESCALATION';

const REQUIRED_PHRASES: Record<ProtectedAction, string> = {
  PRODUCTION_DEPLOY: 'APPROVE PRODUCTION DEPLOY',
  MERGE_PROTECTED_BRANCH: 'APPROVE MERGE TO MAIN',
  PRODUCTION_DB_MIGRATION: 'APPROVE SUPABASE MIGRATION',
  ENV_SECRET_CHANGE: 'APPROVE ENV CHANGE',
  DNS_DOMAIN_CHANGE: 'APPROVE DNS CHANGE',
  PAID_RESOURCE_CREATE: 'APPROVE PAID RESOURCE',
  CUSTOMER_COMMUNICATION: 'APPROVE CUSTOMER MESSAGE',
  DESTRUCTIVE_DELETE: 'APPROVE DESTRUCTIVE DELETE',
  GOVERNANCE_CHANGE: 'APPROVE GOVERNANCE CHANGE',
  PERMISSION_ESCALATION: 'APPROVE PERMISSION CHANGE',
};

export function isApproved(action: ProtectedAction, operatorInput: string): boolean {
  return operatorInput.trim().toUpperCase().includes(REQUIRED_PHRASES[action]);
}

export function getRequiredPhrase(action: ProtectedAction): string {
  return REQUIRED_PHRASES[action];
}

export function assertNotProtected(action: string): void {
  const match = Object.keys(REQUIRED_PHRASES).find(k =>
    action.toUpperCase().includes(k)
  );
  if (match) {
    throw new Error(
      `BLOCKED: '${action}' is a protected action. Required approval phrase: ${REQUIRED_PHRASES[match as ProtectedAction]}`
    );
  }
}
