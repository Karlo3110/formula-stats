export const PLAYBACK_RATES = [1, 2, 4, 8, 16, 32] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/** Keeps a requested clock position inside the replay window. */
export function clampClock(seconds: number, duration: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(seconds, duration);
}

const SECONDS_PER_HOUR = 3600;

function twoDigits(value: number): string {
  return Math.floor(value).toString().padStart(2, '0');
}

/**
 * Broadcast-style session clock relative to `origin` (lights out, or the
 * start of the window): "-00:04" during the countdown, "42:10" once running,
 * "1:02:05" past the hour.
 */
export function formatRaceClock(clock: number, origin: number): string {
  const relative = clock - origin;
  const magnitude = Math.abs(relative);
  const sign = relative < 0 ? '-' : '';
  const minutesAndSeconds = `${twoDigits((magnitude % SECONDS_PER_HOUR) / 60)}:${twoDigits(magnitude % 60)}`;
  if (magnitude < SECONDS_PER_HOUR) return `${sign}${minutesAndSeconds}`;
  return `${sign}${Math.floor(magnitude / SECONDS_PER_HOUR)}:${minutesAndSeconds}`;
}

/** Lap time as "1:23.456" (or "58.123" under a minute). */
export function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return minutes > 0 ? `${minutes}:${rest}` : (seconds % 60).toFixed(3);
}
