import type { DriverResult } from '@/lib/validation/f1-schemas';

const FINISHED_STATUS = 'Finished';
const LAPPED_STATUS = 'Lapped';
const LAPS_DOWN_PREFIX = '+';
const PODIUM_SIZE = 3;

/**
 * FastF1 marks classified cars as "Finished", "Lapped" or "+N Lap(s)"; any
 * other status (Retired, Accident, Disqualified, …) is a non-finish.
 */
export function isClassifiedFinish(result: DriverResult): boolean {
  const status = result.status.trim();
  return (
    status === FINISHED_STATUS || status === LAPPED_STATUS || status.startsWith(LAPS_DOWN_PREFIX)
  );
}

export interface ClassificationSummary {
  starters: number;
  classified: number;
  retired: number;
}

export function summarizeClassification(results: ReadonlyArray<DriverResult>): ClassificationSummary {
  const classified = results.filter(isClassifiedFinish).length;
  return { starters: results.length, classified, retired: results.length - classified };
}

/** Results in finishing order; unclassified (null position) entries last. */
export function sortByPosition(results: ReadonlyArray<DriverResult>): DriverResult[] {
  return [...results].sort(
    (a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER),
  );
}

export function podiumOf(results: ReadonlyArray<DriverResult>): DriverResult[] {
  return sortByPosition(results)
    .filter((result) => result.position !== null)
    .slice(0, PODIUM_SIZE);
}

/** "Lando Norris" → ["Lando", "Norris"]; multi-word family names stay together. */
export function splitDriverName(fullName: string): { given: string; family: string } {
  const [given = '', ...rest] = fullName.trim().split(/\s+/);
  return rest.length > 0 ? { given, family: rest.join(' ') } : { given: '', family: given };
}

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const PIT_LANE_GRID = 0;

function pad(value: number, length: number): string {
  return value.toString().padStart(length, '0');
}

/** 5504.742 → "1:31:44.742" (race duration). */
export function formatRaceDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const secondsText = seconds.toFixed(3).padStart(6, '0');
  return hours > 0 ? `${hours}:${pad(minutes, 2)}:${secondsText}` : `${minutes}:${secondsText}`;
}

/**
 * What the timing screen shows per row: the winner's race time, the gap for
 * cars on the lead lap, otherwise the status ("+1 Lap", "Retired", …).
 */
export function timeOrGapLabel(result: DriverResult, winner: DriverResult | undefined): string {
  if (result.timeSeconds === null) return result.status;
  if (!winner || winner.timeSeconds === null || result === winner) {
    return formatRaceDuration(result.timeSeconds);
  }
  return `+${(result.timeSeconds - winner.timeSeconds).toFixed(3)}s`;
}

/** Grid places gained (positive) or lost; null for pit-lane starts or no data. */
export function positionsGained(result: DriverResult): number | null {
  const { gridPosition, position } = result;
  if (gridPosition === null || position === null || gridPosition === PIT_LANE_GRID) {
    return null;
  }
  return gridPosition - position;
}

const PIT_LANE_LABEL = 'PL';
const NO_DATA_LABEL = '–';

/** Starting slot for display: the grid number, "PL" for a pit-lane start. */
export function gridLabel(result: DriverResult): string {
  if (result.gridPosition === null) return NO_DATA_LABEL;
  return result.gridPosition === PIT_LANE_GRID ? PIT_LANE_LABEL : String(result.gridPosition);
}
