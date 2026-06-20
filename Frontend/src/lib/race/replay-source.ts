import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import type {
  DriverPose,
  DriverStanding,
  RaceSource,
  StandingDriver,
} from './types';

const POLE_LAP_PLAYBACK_SECONDS = 16;
const START_STAGGER = 0.012;
const FALLBACK_COLORS = ['#27f4d2', '#3671c6', '#e8002d', '#ff8000', '#229971'];
const SPEED_BASE_KMH = 220;
const SPEED_MIN_KMH = 70;
const SPEED_MAX_KMH = 360;

interface ReplayCar {
  driver: StandingDriver;
  lapTime: number;
  /** [t, x, y] rows, t uniform 0..1. */
  samples: number[][];
  offset: number;
  totalLength: number;
}

interface SampleAt {
  x: number;
  y: number;
  segmentLength: number;
}

function totalLength(samples: number[][]): number {
  let length = 0;
  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    if (!a || !b) continue;
    length += Math.hypot((b[1] ?? 0) - (a[1] ?? 0), (b[2] ?? 0) - (a[2] ?? 0));
  }
  return length;
}

/** Drives cars from official FastF1 per-driver fastest-lap position traces. */
export class ReplaySource implements RaceSource {
  readonly drivers: StandingDriver[];
  private readonly cars: ReplayCar[];
  private readonly refLap: number;
  private elapsed = 0;

  constructor(replayDrivers: ReplayDriver[]) {
    const sorted = [...replayDrivers].sort(
      (a, b) => a.lapTimeSeconds - b.lapTimeSeconds,
    );
    this.refLap = sorted[0]?.lapTimeSeconds ?? 1;

    this.cars = sorted.map((d, index) => ({
      driver: {
        id: d.code,
        code: d.code,
        name: d.code,
        team: d.team,
        color: d.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#9fb6b9',
      },
      lapTime: d.lapTimeSeconds,
      samples: d.samples,
      offset: index * START_STAGGER,
      totalLength: totalLength(d.samples),
    }));
    this.drivers = this.cars.map((car) => car.driver);
  }

  tick(dt: number): void {
    this.elapsed += dt;
  }

  pose(driverId: string): DriverPose | null {
    const car = this.cars.find((c) => c.driver.id === driverId);
    if (!car) return null;
    const f = this.fraction(car);
    const next = this.sampleAt(car, f, true);
    const current = this.sampleAt(car, f, false);
    return {
      x: current.x,
      z: current.y,
      headingY: Math.atan2(next.x - current.x, next.y - current.y),
    };
  }

  standings(): DriverStanding[] {
    const ranked = this.cars
      .map((car) => ({ car, f: this.fraction(car) }))
      .sort((a, b) => b.f - a.f);
    const leaderF = ranked[0]?.f ?? 0;

    return ranked.map((entry, index) => ({
      driver: entry.car.driver,
      position: index + 1,
      lap: Math.floor(this.elapsed / POLE_LAP_PLAYBACK_SECONDS) + 1,
      gapSeconds: (leaderF - entry.f) * entry.car.lapTime,
      speedKmh: this.speedKmh(entry.car, entry.f),
      trackT: entry.f,
    }));
  }

  private fraction(car: ReplayCar): number {
    const lapPlayback = POLE_LAP_PLAYBACK_SECONDS * (car.lapTime / this.refLap);
    return (((this.elapsed / lapPlayback + car.offset) % 1) + 1) % 1;
  }

  private sampleAt(car: ReplayCar, f: number, lookAhead: boolean): SampleAt {
    const n = car.samples.length;
    const p = f * (n - 1);
    const base = Math.min(Math.floor(p) + (lookAhead ? 1 : 0), n - 1);
    const a = car.samples[Math.min(base, n - 1)];
    const b = car.samples[Math.min(base + 1, n - 1)];
    const frac = lookAhead ? 0 : p - Math.floor(p);
    const ax = a?.[1] ?? 0;
    const ay = a?.[2] ?? 0;
    const bx = b?.[1] ?? ax;
    const by = b?.[2] ?? ay;
    return {
      x: ax + (bx - ax) * frac,
      y: ay + (by - ay) * frac,
      segmentLength: Math.hypot(bx - ax, by - ay),
    };
  }

  private speedKmh(car: ReplayCar, f: number): number {
    if (car.totalLength <= 0) return SPEED_BASE_KMH;
    const segments = car.samples.length - 1;
    const dtPerSegment = car.lapTime / segments;
    const local = this.sampleAt(car, f, false).segmentLength / dtPerSegment;
    const average = car.totalLength / car.lapTime;
    const ratio = average > 0 ? local / average : 1;
    return Math.max(
      SPEED_MIN_KMH,
      Math.min(SPEED_MAX_KMH, Math.round(ratio * SPEED_BASE_KMH)),
    );
  }
}
