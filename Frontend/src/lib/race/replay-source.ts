import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  RaceTiming,
  StandingDriver,
} from './types';

const FALLBACK_COLORS = ['#27f4d2', '#3671c6', '#e8002d', '#ff8000', '#229971'];
// A car must be clearly ahead (metres) to take a position — kills flicker.
const OVERTAKE_EPSILON = 2;

// Sample layout: [t, x, y, speedKmh, distanceMetres]
const X = 1;
const Y = 2;
const SPEED = 3;
const DISTANCE = 4;

interface ReplayCar {
  driver: StandingDriver;
  samples: number[][];
  maxDistance: number;
}

/** Plays all drivers on one shared race clock from official telemetry. */
export class ReplaySource implements RaceSource {
  readonly drivers: StandingDriver[];
  private readonly cars: ReplayCar[];
  private readonly byId: Map<string, ReplayCar>;
  private readonly duration: number;
  private readonly lightsOut: number;
  private order: string[];
  private elapsed = 0;

  constructor(
    replayDrivers: ReplayDriver[],
    durationSeconds: number,
    lightsOutSeconds: number,
  ) {
    this.duration = durationSeconds > 0 ? durationSeconds : 1;
    this.lightsOut = lightsOutSeconds;
    this.cars = replayDrivers.map((d, index) => {
      const last = d.samples[d.samples.length - 1];
      return {
        driver: {
          id: d.code,
          code: d.code,
          name: d.code,
          team: d.team,
          color: d.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#9fb6b9',
        },
        samples: d.samples,
        maxDistance: last?.[DISTANCE] ?? 0,
      };
    });
    this.drivers = this.cars.map((car) => car.driver);
    this.byId = new Map(this.cars.map((car) => [car.driver.id, car]));
    this.order = this.cars.map((car) => car.driver.id);
  }

  tick(dt: number): void {
    this.elapsed += dt;
  }

  pose(driverId: string): DriverPose | null {
    const car = this.byId.get(driverId);
    if (!car) return null;
    const { a, b, frac } = this.locate(car);
    const ax = a?.[X] ?? 0;
    const ay = a?.[Y] ?? 0;
    const bx = b?.[X] ?? ax;
    const by = b?.[Y] ?? ay;
    return {
      x: ax + (bx - ax) * frac,
      z: ay + (by - ay) * frac,
      headingY: Math.atan2(bx - ax, by - ay),
    };
  }

  standings(): DriverStanding[] {
    const distance = new Map<string, number>();
    for (const car of this.cars) {
      distance.set(car.driver.id, this.field(car, DISTANCE));
    }

    const order = this.order;
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < order.length - 1; i += 1) {
        const ahead = order[i];
        const behind = order[i + 1];
        if (!ahead || !behind) continue;
        if ((distance.get(behind) ?? 0) > (distance.get(ahead) ?? 0) + OVERTAKE_EPSILON) {
          order[i] = behind;
          order[i + 1] = ahead;
          changed = true;
        }
      }
    }

    const leaderId = order[0];
    const leaderDistance = leaderId ? distance.get(leaderId) ?? 0 : 0;
    const avgSpeedMps = leaderDistance / this.duration;

    const result: DriverStanding[] = [];
    order.forEach((id, index) => {
      const car = this.byId.get(id);
      if (!car) return;
      const d = distance.get(id) ?? 0;
      result.push({
        driver: car.driver,
        position: index + 1,
        lap: 1,
        gapSeconds: avgSpeedMps > 0 ? (leaderDistance - d) / avgSpeedMps : 0,
        speedKmh: Math.round(this.field(car, SPEED)),
        trackT: car.maxDistance > 0 ? d / car.maxDistance : 0,
      });
    });
    return result;
  }

  timing(): RaceTiming {
    return {
      clock: this.clock(),
      lightsOut: this.lightsOut,
      durationSeconds: this.duration,
    };
  }

  private clock(): number {
    return this.elapsed % this.duration;
  }

  private locate(car: ReplayCar): {
    a: number[] | undefined;
    b: number[] | undefined;
    frac: number;
  } {
    const n = car.samples.length;
    const p = (this.clock() / this.duration) * (n - 1);
    const index = Math.min(Math.floor(p), n - 1);
    return {
      a: car.samples[index],
      b: car.samples[Math.min(index + 1, n - 1)],
      frac: p - Math.floor(p),
    };
  }

  /** Interpolated value of a sample field at the current clock. */
  private field(car: ReplayCar, fieldIndex: number): number {
    const { a, b, frac } = this.locate(car);
    const av = a?.[fieldIndex] ?? 0;
    const bv = b?.[fieldIndex] ?? av;
    return av + (bv - av) * frac;
  }
}
