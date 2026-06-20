import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  StandingDriver,
} from './types';

const FALLBACK_COLORS = ['#27f4d2', '#3671c6', '#e8002d', '#ff8000', '#229971'];
const SPEED_BASE_KMH = 240;
const SPEED_MIN_KMH = 0;
const SPEED_MAX_KMH = 360;

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
  private readonly duration: number;
  private elapsed = 0;

  constructor(replayDrivers: ReplayDriver[], durationSeconds: number) {
    this.duration = durationSeconds > 0 ? durationSeconds : 1;
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
  }

  tick(dt: number): void {
    this.elapsed += dt;
  }

  pose(driverId: string): DriverPose | null {
    const car = this.cars.find((c) => c.driver.id === driverId);
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
    const clock = this.clock();
    const ranked = this.cars
      .map((car) => ({ car, distance: this.distanceAt(car) }))
      .sort((x, y) => y.distance - x.distance);
    const leader = ranked[0]?.distance ?? 0;
    const refSpeed = leader / Math.max(clock, 1);

    return ranked.map((entry, index) => ({
      driver: entry.car.driver,
      position: index + 1,
      lap: 1,
      gapSeconds: refSpeed > 0 ? (leader - entry.distance) / refSpeed : 0,
      speedKmh: this.speedKmh(entry.car),
      trackT: entry.car.totalLength > 0 ? entry.distance / entry.car.totalLength : 0,
    }));
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
