import type { ReplayMessage } from '@/lib/validation/f1-schemas';

/** How long a race-control message stays in the bottom-right feed, seconds. */
export const FEED_VISIBLE_SECONDS = 7;
/** Max messages shown in the feed at once. */
export const FEED_MAX = 4;

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

/** Messages that should currently be visible in the feed, newest first. */
export function visibleFeed(
  messages: ReadonlyArray<ReplayMessage>,
  clock: number,
): ReplayMessage[] {
  const visible: ReplayMessage[] = [];
  for (const msg of messages) {
    const age = clock - msg.time;
    if (age >= 0 && age <= FEED_VISIBLE_SECONDS) {
      visible.push(msg);
    }
  }
  return visible.slice(-FEED_MAX).reverse();
}
