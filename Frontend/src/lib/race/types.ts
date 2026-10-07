import type { SessionKind } from '@/lib/validation/f1-schemas';

export interface RaceDriver {
  id: string;
  code: string;
  name: string;
  team: string;
  color: string;
  /** Base lap time in seconds for the simulation (smaller = faster). */
  baseLapSeconds: number;
}

export interface StandingDriver {
  id: string;
  code: string;
  name: string;
  team: string;
  color: string;
}

export const CarStatus = {
  Running: 'running',
  Pit: 'pit',
  Out: 'out',
} as const;

export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus];

export interface DriverStanding {
  driver: StandingDriver;
  position: number;
  /**
   * Race: seconds behind the leader. Qualifying/practice: best lap off the
   * fastest. Null when there is no meaningful gap (no lap set, retired).
   */
  gapSeconds: number | null;
  speedKmh: number;
  /** Lap the car is on (1-based), capped at the race distance. */
  lap: number;
  lastLapSeconds: number | null;
  bestLapSeconds: number | null;
  status: CarStatus;
}

export interface DriverPose {
  x: number;
  /** Elevation (world up axis) so cars sit on the sloped track surface. */
  y: number;
  z: number;
  headingY: number;
  status: CarStatus;
}

export interface RaceTiming {
  /** Current playback time within the window, seconds. */
  clock: number;
  /** When the lights go out within the window; null when there is no start. */
  lightsOut: number | null;
  durationSeconds: number;
  /** Playback reached the end of the replay window. */
  ended: boolean;
  sessionKind: SessionKind;
  /** Leader's current lap in a race; null for qualifying/practice. */
  lap: number | null;
  totalLaps: number | null;
}

/** Drives the 3D scene; implemented by the official-replay and mock sources. */
export interface RaceSource {
  readonly drivers: StandingDriver[];
  /** Advances playback by `dt` seconds of replay time. */
  tick(dt: number): void;
  /** Jumps playback to an absolute replay time, seconds. */
  seek(seconds: number): void;
  pose(driverId: string): DriverPose | null;
  standings(): DriverStanding[];
  timing(): RaceTiming | null;
}
