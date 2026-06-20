export const EARLIEST_SEASON = 2021;

/** The current F1 season, derived from the calendar year. */
export function getCurrentSeason(now: Date = new Date()): number {
  return now.getUTCFullYear();
}

/** Past seasons only (everything before the current one), newest first. */
export function getPastSeasons(now: Date = new Date()): number[] {
  const current = getCurrentSeason(now);
  const count = Math.max(current - EARLIEST_SEASON, 0);
  return Array.from({ length: count }, (_, index) => current - 1 - index);
}
