import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import type { SpineSample } from './ribbon';

const PIT_STATUS = 1;
// Moving down the pit lane (the limiter is 60-80 km/h); excludes garage stops.
const MIN_PIT_SPEED_KMH = 30;
// Further from the centre-line than the road edge: actually in the pit lane.
const MIN_PIT_OFFSET_TRACK_WIDTHS = 0.7;
const MIN_BIN_SAMPLES = 2;
const MIN_RUN_BINS = 4;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? (sorted[mid] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function collectPitOffsets(drivers: ReadonlyArray<ReplayDriver>, lapLength: number, binSize: number, trackWidth: number): number[][] {
  const bins: number[][] = Array.from({ length: Math.ceil(lapLength / binSize) }, () => []);
  for (const driver of drivers) {
    driver.status.forEach((status, i) => {
      const lateral = driver.lateral[i] ?? 0;
      const isMovingInPitLane =
        status === PIT_STATUS &&
        (driver.speed[i] ?? 0) >= MIN_PIT_SPEED_KMH &&
        Math.abs(lateral) >= trackWidth * MIN_PIT_OFFSET_TRACK_WIDTHS;
      if (!isMovingInPitLane) return;
      const distance = (((driver.progress[i] ?? 0) % lapLength) + lapLength) % lapLength;
      bins[Math.min(Math.floor(distance / binSize), bins.length - 1)]?.push(lateral);
    });
  }
  return bins;
}

/** Contiguous runs of populated bins, scanning the loop from an empty bin so a run can cross the line. */
function runsOf(offsets: ReadonlyArray<number | null>): number[][] {
  const n = offsets.length;
  const startBin = offsets.findIndex((value) => value === null);
  if (startBin < 0) return [];
  const runs: number[][] = [];
  let current: number[] = [];
  for (let k = 1; k <= n; k += 1) {
    const bin = startBin + k;
    if (offsets[bin % n] === null) {
      if (current.length > 0) runs.push(current);
      current = [];
    } else {
      current.push(bin);
    }
  }
  return runs.filter((run) => run.length >= MIN_RUN_BINS);
}

/**
 * Pit lane path recovered from where pitting cars actually drove: the median
 * offset from the centre-line of moving pit-lane samples, binned by distance.
 * Distances may run past the lap length when the lane crosses the line.
 */
export function derivePitLane(
  drivers: ReadonlyArray<ReplayDriver>,
  lapLength: number,
  trackWidth: number,
): SpineSample[][] {
  const binSize = trackWidth;
  const offsets = collectPitOffsets(drivers, lapLength, binSize, trackWidth).map((values) =>
    values.length >= MIN_BIN_SAMPLES ? median(values) : null,
  );
  return runsOf(offsets).map((run) =>
    run.map((bin) => ({ distance: (bin + 0.5) * binSize, lateral: offsets[bin % offsets.length] ?? 0 })),
  );
}
