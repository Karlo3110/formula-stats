/** Account lifecycle states (.claude/rules/database/database-standards.md). */
export const AccountStatus = {
  PendingVerification: 'PENDING_VERIFICATION',
  Active: 'ACTIVE',
  Suspended: 'SUSPENDED',
  Locked: 'LOCKED',
  Deactivated: 'DEACTIVATED',
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
