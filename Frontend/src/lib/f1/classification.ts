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
