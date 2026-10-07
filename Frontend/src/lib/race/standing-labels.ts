import type { SessionKind } from '@/lib/validation/f1-schemas';

import { formatLapTime } from './playback';
import { CarStatus, type DriverStanding } from './types';

const NO_VALUE = '—';

const STATUS_LABELS: Record<CarStatus, string> = {
  running: 'On track',
  pit: 'In pit',
  out: 'Out',
};

export function statusLabel(status: CarStatus): string {
  return STATUS_LABELS[status];
}

function raceGapLabel(standing: DriverStanding): string {
  if (standing.position === 1) return 'Leader';
  return standing.gapSeconds === null ? NO_VALUE : `+${standing.gapSeconds.toFixed(1)}`;
}

function bestLapGapLabel(standing: DriverStanding): string {
  if (standing.gapSeconds === null || standing.bestLapSeconds === null) return 'No time';
  return standing.gapSeconds === 0 ? formatLapTime(standing.bestLapSeconds) : `+${standing.gapSeconds.toFixed(3)}`;
}

/** Right-hand column of the timing tower: race gap, or best lap / gap to the fastest. */
export function towerGapLabel(standing: DriverStanding, kind: SessionKind): string {
  if (standing.status === CarStatus.Out) return 'Out';
  return kind === 'race' ? raceGapLabel(standing) : bestLapGapLabel(standing);
}

export function towerColumnTitle(kind: SessionKind): string {
  return kind === 'race' ? 'Gap' : 'Best lap';
}

export function towerTitle(kind: SessionKind): string {
  return kind === 'race' ? 'Running order' : 'Timing';
}

/** Detailed gap for the driver panel ("+1.42 s", "Leader", "No time"). */
export function focusGapLabel(standing: DriverStanding, kind: SessionKind): string {
  if (kind !== 'race') return bestLapGapLabel(standing);
  if (standing.position === 1) return 'Leader';
  return standing.gapSeconds === null ? NO_VALUE : `+${standing.gapSeconds.toFixed(2)} s`;
}

export function lapTimeLabel(seconds: number | null): string {
  return seconds === null ? NO_VALUE : formatLapTime(seconds);
}
