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

export interface DriverStanding {
  driver: StandingDriver;
  position: number;
  lap: number;
  /** Gap to the leader in seconds. */
  gapSeconds: number;
  speedKmh: number;
  /** Fractional position around the lap, 0..1. */
  trackT: number;
}

export interface DriverPose {
  x: number;
  /** Elevation (world up axis) so cars sit on the sloped track surface. */
  y: number;
  z: number;
  headingY: number;
  /** Whether the car is on the track (vs run-off) at this moment. */
  onTrack: boolean;
}

export interface RaceTiming {
  /** Current playback time within the window, seconds. */
  clock: number;
  /** When the lights go out within the window, seconds (0 = no countdown). */
  lightsOut: number;
  durationSeconds: number;
}

/** Drives the 3D scene; implemented by the official-replay and mock sources. */
export interface RaceSource {
  readonly drivers: StandingDriver[];
  tick(dt: number): void;
  pose(driverId: string): DriverPose | null;
  standings(): DriverStanding[];
  timing(): RaceTiming | null;
}
