import * as THREE from 'three';

import { RACE_DRIVERS, raceEngine } from './race-engine';
import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  RaceTiming,
  StandingDriver,
} from './types';

/** Wraps the synthetic race engine; used as a fallback when no official replay. */
export class MockSource implements RaceSource {
  readonly drivers: StandingDriver[];
  private readonly point = new THREE.Vector3();
  private readonly tangent = new THREE.Vector3();

  constructor(private readonly curve: THREE.CatmullRomCurve3) {
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

  pose(driverId: string): DriverPose | null {
    const t = raceEngine.trackT(driverId);
    this.curve.getPointAt(t, this.point);
    this.curve.getTangentAt(t, this.tangent);
    return {
      x: this.point.x,
      y: this.point.y,
      z: this.point.z,
      headingY: Math.atan2(this.tangent.x, this.tangent.z),
      onTrack: true,
    };
  }

  standings(): DriverStanding[] {
    return raceEngine.standings();
  }

  timing(): RaceTiming | null {
    return null;
  }
}
