import { CarStatus } from './types';

/** Where the playback clock falls between two evenly spaced samples. */
export interface SampleCursor {
  index: number;
  next: number;
  /** 0..1 between `index` and `next`. */
  frac: number;
}

export function sampleCursor(clock: number, interval: number, count: number): SampleCursor {
  const last = Math.max(count - 1, 0);
  const position = Math.min(Math.max(clock / interval, 0), last);
  const index = Math.floor(position);
  return { index, next: Math.min(index + 1, last), frac: position - index };
}

export function lerpAt(values: ReadonlyArray<number>, cursor: SampleCursor): number {
  const a = values[cursor.index] ?? 0;
  const b = values[cursor.next] ?? a;
  return a + (b - a) * cursor.frac;
}

/** Interpolates where both neighbours exist; otherwise the nearer defined value. */
export function nullableLerpAt(values: ReadonlyArray<number | null>, cursor: SampleCursor): number | null {
  const a = values[cursor.index] ?? null;
  const b = values[cursor.next] ?? null;
  if (a !== null && b !== null) return a + (b - a) * cursor.frac;
  return cursor.frac < 0.5 ? a : b;
}

const STATUS_BY_CODE: ReadonlyArray<CarStatus> = [CarStatus.Running, CarStatus.Pit, CarStatus.Out];

export function carStatusOf(code: number | undefined): CarStatus {
  return STATUS_BY_CODE[code ?? 0] ?? CarStatus.Running;
}

export interface LapSummary {
  completed: number;
  lastLapSeconds: number | null;
  bestLapSeconds: number | null;
}

/** Laps finished by `clock`: count, the latest lap time and the best one. */
export function lapSummary(laps: ReadonlyArray<readonly [number, number | null]>, clock: number): LapSummary {
  let completed = 0;
  let lastLapSeconds: number | null = null;
  let bestLapSeconds: number | null = null;
  for (const [end, lapTime] of laps) {
    if (end > clock) break;
    completed += 1;
    lastLapSeconds = lapTime;
    if (lapTime !== null && (bestLapSeconds === null || lapTime < bestLapSeconds)) {
      bestLapSeconds = lapTime;
    }
  }
  return { completed, lastLapSeconds, bestLapSeconds };
}

/** Lap the car is on: one past the laps completed, never beyond the race distance. */
export function currentLap(completed: number, totalLaps: number | null): number {
  const lap = completed + 1;
  return totalLaps !== null ? Math.min(lap, totalLaps) : lap;
}
