import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  RaceTiming,
  StandingDriver,
} from './types';

const FALLBACK_COLORS = ['#27f4d2', '#3671c6', '#e8002d', '#ff8000', '#229971'];
const SPEED_BASE_KMH = 240;
const SPEED_MIN_KMH = 0;
const SPEED_MAX_KMH = 360;
// A car must be clearly ahead (world units) to take a position — kills flicker.
const OVERTAKE_EPSILON = 1.5;

interface ReplayCar {
  driver: StandingDriver;
  samples: number[][]; // [t, x, y], t uniform over the window
  cumulative: number[]; // distance travelled up to each sample
  totalLength: number;
}

function buildCumulative(samples: number[][]): number[] {
  const cumulative: number[] = [0];
  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    const step =
      a && b ? Math.hypot((b[1] ?? 0) - (a[1] ?? 0), (b[2] ?? 0) - (a[2] ?? 0)) : 0;
    cumulative.push((cumulative[i - 1] ?? 0) + step);
  }
  return cumulative;
}

/** Plays all drivers on one shared race clock (real wheel-to-wheel positions). */
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
    this.cars = replayDrivers.map((d, index) => ({
      driver: {
        id: d.code,
        code: d.code,
        name: d.code,
        team: d.team,
        color: d.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#9fb6b9',
      },
      samples: d.samples,
      cumulative: buildCumulative(d.samples),
      totalLength: 0,
    }));
    this.cars.forEach((car) => {
      car.totalLength = car.cumulative[car.cumulative.length - 1] ?? 0;
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
    const ax = a?.[1] ?? 0;
    const ay = a?.[2] ?? 0;
    const bx = b?.[1] ?? ax;
    const by = b?.[2] ?? ay;
    return {
      x: ax + (bx - ax) * frac,
      z: ay + (by - ay) * frac,
      headingY: Math.atan2(bx - ax, by - ay),
    };
  }

  standings(): DriverStanding[] {
    const distance = new Map<string, number>();
    for (const car of this.cars) {
      distance.set(car.driver.id, this.distanceAt(car));
    }

    // Reorder the persistent order only when a car is clearly ahead (hysteresis),
    // so the running order is stable and matches what's on screen.
    const order = this.order;
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < order.length - 1; i += 1) {
        const ahead = order[i];
        const behind = order[i + 1];
        if (!ahead || !behind) continue;
        if (
          (distance.get(behind) ?? 0) >
          (distance.get(ahead) ?? 0) + OVERTAKE_EPSILON
        ) {
          order[i] = behind;
          order[i + 1] = ahead;
          changed = true;
        }
      }
    }

    const leaderId = order[0];
    const leaderCar = leaderId ? this.byId.get(leaderId) : undefined;
    const leaderDistance = leaderId ? distance.get(leaderId) ?? 0 : 0;
    const refSpeed =
      leaderCar && leaderCar.totalLength > 0
        ? leaderCar.totalLength / this.duration
        : 1;

    const result: DriverStanding[] = [];
    order.forEach((id, index) => {
      const car = this.byId.get(id);
      if (!car) return;
      const d = distance.get(id) ?? 0;
      result.push({
        driver: car.driver,
        position: index + 1,
        lap: 1,
        gapSeconds: refSpeed > 0 ? (leaderDistance - d) / refSpeed : 0,
        speedKmh: this.speedKmh(car),
        trackT: car.totalLength > 0 ? d / car.totalLength : 0,
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
    index: number;
    frac: number;
  } {
    const n = car.samples.length;
    const p = (this.clock() / this.duration) * (n - 1);
    const index = Math.min(Math.floor(p), n - 1);
    return {
      a: car.samples[index],
      b: car.samples[Math.min(index + 1, n - 1)],
      index,
      frac: p - Math.floor(p),
    };
  }

  private distanceAt(car: ReplayCar): number {
    const { index, frac } = this.locate(car);
    const c0 = car.cumulative[index] ?? 0;
    const c1 = car.cumulative[Math.min(index + 1, car.cumulative.length - 1)] ?? c0;
    return c0 + (c1 - c0) * frac;
  }

  private speedKmh(car: ReplayCar): number {
    if (car.totalLength <= 0) return SPEED_BASE_KMH;
    const { index } = this.locate(car);
    const c0 = car.cumulative[index] ?? 0;
    const c1 = car.cumulative[Math.min(index + 1, car.cumulative.length - 1)] ?? c0;
    const dtPerSegment = this.duration / (car.samples.length - 1);
    const local = (c1 - c0) / dtPerSegment;
    const average = car.totalLength / this.duration;
    const ratio = average > 0 ? local / average : 1;
    return Math.max(
      SPEED_MIN_KMH,
      Math.min(SPEED_MAX_KMH, Math.round(ratio * SPEED_BASE_KMH)),
    );
  }
}
