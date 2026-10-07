import type { Centerline } from './centerline';
import { RACE_DRIVERS, raceEngine } from './race-engine';
import {
  CarStatus,
  type DriverPose,
  type DriverStanding,
  type RaceSource,
  type RaceTiming,
  type StandingDriver,
} from './types';

/** Wraps the synthetic race engine; shown behind loading and empty states. */
export class MockSource implements RaceSource {
  readonly drivers: StandingDriver[];

  constructor(private readonly centerline: Centerline) {
    this.drivers = RACE_DRIVERS.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      team: d.team,
      color: d.color,
    }));
  }

  tick(dt: number): void {
    raceEngine.tick(dt);
  }

  seek(): void {
    // The synthetic race runs continuously; there is no timeline to seek.
  }

  pose(driverId: string): DriverPose | null {
    const placement = this.centerline.placeAtFraction(raceEngine.trackT(driverId));
    return {
      x: placement.x,
      y: placement.y,
      z: placement.z,
      headingY: Math.atan2(placement.tangentX, placement.tangentZ),
      status: CarStatus.Running,
    };
  }

  standings(): DriverStanding[] {
    return raceEngine.standings();
  }

  timing(): RaceTiming | null {
    return null;
  }
}
