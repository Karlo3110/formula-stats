import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import { clampClock } from './playback';

import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  RaceTiming,
  StandingDriver,
} from './types';

const FALLBACK_COLORS = ['#3671c6', '#e8002d', '#ff8000', '#27a8d2', '#229971'];

// Sample layout: [t, x, y, elevation, speedKmh, position, progressMetres, onTrack]
const X = 1;
const Y = 2;
const ELEVATION = 3;
const SPEED = 4;
const POSITION = 5;
const PROGRESS = 6;
const ON_TRACK = 7;

interface ReplayCar {
  driver: StandingDriver;
  samples: number[][];
  maxProgress: number;
}

/** Plays all drivers on one shared race clock from official telemetry.
 *  Order and gaps come from the position/progress computed server-side.
 *  The clock runs from 0 to the window duration and holds at the end. */
export class ReplaySource implements RaceSource {
  readonly drivers: StandingDriver[];
  private readonly cars: ReplayCar[];
  private readonly byId: Map<string, ReplayCar>;
  private readonly duration: number;
  private readonly lightsOut: number;
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
        maxProgress: last?.[PROGRESS] ?? 0,
      };
    });
    this.drivers = this.cars.map((car) => car.driver);
    this.byId = new Map(this.cars.map((car) => [car.driver.id, car]));
  }

  tick(dt: number): void {
    this.elapsed = clampClock(this.elapsed + dt, this.duration);
  }

  seek(seconds: number): void {
    this.elapsed = clampClock(seconds, this.duration);
  }

  pose(driverId: string): DriverPose | null {
    const car = this.byId.get(driverId);
    if (!car) return null;
    const { a, b, frac } = this.locate(car);
    const ax = a?.[X] ?? 0;
    const ay = a?.[Y] ?? 0;
    const bx = b?.[X] ?? ax;
    const by = b?.[Y] ?? ay;
    const aElev = a?.[ELEVATION] ?? 0;
    const bElev = b?.[ELEVATION] ?? aElev;
    return {
      x: ax + (bx - ax) * frac,
      y: aElev + (bElev - aElev) * frac,
      z: ay + (by - ay) * frac,
      headingY: Math.atan2(bx - ax, by - ay),
      onTrack: (a?.[ON_TRACK] ?? 1) > 0.5,
    };
  }

  standings(): DriverStanding[] {
    const rows = this.cars.map((car) => ({
      car,
      position: this.current(car, POSITION),
      progress: this.field(car, PROGRESS),
    }));
    rows.sort((p, q) => p.position - q.position);

    const leaderProgress = rows[0]?.progress ?? 0;
    const leaderCar = rows[0]?.car;
    const avgSpeedMps =
      leaderCar && leaderCar.maxProgress > 0
        ? leaderCar.maxProgress / this.duration
        : 1;

    return rows.map((row) => ({
      driver: row.car.driver,
      position: row.position,
      gapSeconds:
        avgSpeedMps > 0 ? Math.max(0, (leaderProgress - row.progress) / avgSpeedMps) : 0,
      speedKmh: Math.round(this.field(row.car, SPEED)),
      trackT: row.car.maxProgress > 0 ? row.progress / row.car.maxProgress : 0,
      onTrack: this.current(row.car, ON_TRACK) > 0.5,
    }));
  }

  timing(): RaceTiming {
    return {
      clock: this.clock(),
      lightsOut: this.lightsOut,
      durationSeconds: this.duration,
      ended: this.elapsed >= this.duration,
    };
  }

  private clock(): number {
    return this.elapsed;
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

  /** Interpolated sample field at the current clock. */
  private field(car: ReplayCar, fieldIndex: number): number {
    const { a, b, frac } = this.locate(car);
    const av = a?.[fieldIndex] ?? 0;
    const bv = b?.[fieldIndex] ?? av;
    return av + (bv - av) * frac;
  }

  /** Discrete sample field at the current clock (no interpolation). */
  private current(car: ReplayCar, fieldIndex: number): number {
    const { a, index } = this.locate(car);
    return a?.[fieldIndex] ?? index + 1;
  }
}
