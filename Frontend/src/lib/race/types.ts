export interface RaceDriver {
  id: string;
  code: string;
  name: string;
  team: string;
  color: string;
  /** Base lap time in seconds for the simulation (smaller = faster). */
  baseLapSeconds: number;
}

export interface DriverStanding {
  driver: RaceDriver;
  position: number;
  lap: number;
  /** Gap to the leader in seconds. */
  gapSeconds: number;
  speedKmh: number;
  /** Fractional position around the lap, 0..1. */
  trackT: number;
}
