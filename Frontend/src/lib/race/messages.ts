import type { ReplayMessage } from '@/lib/validation/f1-schemas';

const HAZARD_FLAGS = new Set(['YELLOW', 'DOUBLE YELLOW', 'RED']);

export interface ActiveFlag {
  flag: string;
  scope: string | null;
}

/**
 * The flag in force at the current clock: the most recent flag message at or
 * before `clock`, unless it has been cleared by a GREEN/CHEQUERED. Returns null
 * when racing is green (no overlay).
 */
export function activeFlag(
  messages: ReadonlyArray<ReplayMessage>,
  clock: number,
): ActiveFlag | null {
  let current: ActiveFlag | null = null;
  for (const msg of messages) {
    if (msg.time > clock) break;
    if (msg.category !== 'Flag' || !msg.flag) continue;
    const flag = msg.flag.toUpperCase();
    if (HAZARD_FLAGS.has(flag)) {
      current = { flag, scope: msg.scope };
    } else {
      // GREEN, CHEQUERED, CLEAR, etc. clear any standing hazard.
      current = null;
    }
  }
  return current;
}
