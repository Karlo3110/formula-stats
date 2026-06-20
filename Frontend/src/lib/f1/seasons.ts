export const EARLIEST_SEASON = 2021;

/** The current F1 season, derived from the calendar year. */
export function getCurrentSeason(now: Date = new Date()): number {
  return now.getUTCFullYear();
}

/** Selectable seasons, newest first, from the current season back to the earliest. */
export function getSelectableSeasons(now: Date = new Date()): number[] {
  const current = getCurrentSeason(now);
  const count = Math.max(current - EARLIEST_SEASON + 1, 1);
  return Array.from({ length: count }, (_, index) => current - index);
}
