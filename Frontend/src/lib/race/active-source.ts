import type { DriverStanding, RaceSource, RaceTiming } from './types';

/**
 * Module-level handle to the live race source, so the side panels (outside the
 * R3F tree) can read standings without prop-drilling through the Canvas.
 */
let activeSource: RaceSource | null = null;

export function setActiveSource(source: RaceSource | null): void {
  activeSource = source;
}

export function readStandings(): DriverStanding[] {
  return activeSource ? activeSource.standings() : [];
}

export function readTiming(): RaceTiming | null {
  return activeSource ? activeSource.timing() : null;
}
