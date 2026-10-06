export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const ELAPSED: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

/** Splits the time remaining until `targetMs` into display units. */
export function computeCountdown(targetMs: number | null, nowMs: number): Countdown {
  if (targetMs === null) {
    return ELAPSED;
  }
  const remaining = targetMs - nowMs;
  if (remaining <= 0) {
    return ELAPSED;
  }
  return {
    days: Math.floor(remaining / DAY_MS),
    hours: Math.floor((remaining % DAY_MS) / HOUR_MS),
    minutes: Math.floor((remaining % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((remaining % MINUTE_MS) / SECOND_MS),
    isPast: false,
  };
}
