import { CarStatus, type DriverStanding, type RaceSource, type RaceTiming } from './types';

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

export interface CarMarker {
  id: string;
  code: string;
  color: string;
  x: number;
  z: number;
}

/** Current top-down position of every car still in the session, for the 2D track map. */
export function readCarMarkers(): CarMarker[] {
  const source = activeSource;
  if (!source) return [];
  return source.drivers.flatMap((driver) => {
    const pose = source.pose(driver.id);
    return pose && pose.status !== CarStatus.Out
      ? [{ id: driver.id, code: driver.code, color: driver.color, x: pose.x, z: pose.z }]
      : [];
  });
}

export function seekActiveSource(seconds: number): void {
  activeSource?.seek(seconds);
}
