export const PLAYBACK_RATES = [0.5, 1, 2, 4] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/** Keeps a requested clock position inside the replay window. */
export function clampClock(seconds: number, duration: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(seconds, duration);
}

function twoDigits(value: number): string {
  return Math.floor(value).toString().padStart(2, '0');
}

/**
 * Broadcast-style race clock relative to lights out: "-00:04" during the
 * countdown, "00:42" once racing (minutes:seconds).
 */
export function formatRaceClock(clock: number, lightsOut: number): string {
  const relative = clock - lightsOut;
  const magnitude = Math.abs(relative);
  const sign = relative < 0 ? '-' : '';
  return `${sign}${twoDigits(magnitude / 60)}:${twoDigits(magnitude % 60)}`;
}
