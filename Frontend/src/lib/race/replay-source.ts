import type { ReplayDriver, ReplaySession } from '@/lib/validation/f1-schemas';

import type { Centerline } from './centerline';
import { clampClock } from './playback';
import {
  carStatusOf,
  currentLap,
  lapSummary,
  lerpAt,
  nullableLerpAt,
  sampleCursor,
  type SampleCursor,
} from './replay-sampling';
import type { DriverPose, DriverStanding, RaceSource, RaceTiming, StandingDriver } from './types';

const FALLBACK_COLORS = ['#3671c6', '#e8002d', '#ff8000', '#27a8d2', '#229971'];

interface ReplayCar {
  driver: StandingDriver;
  columns: ReplayDriver;
}

function toStandingDriver(columns: ReplayDriver, index: number): StandingDriver {
  return {
    id: columns.code,
    code: columns.code,
    name: columns.code,
    team: columns.team,
    color: columns.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] ?? '#9fb6b9',
  };
}

/**
 * Plays a whole session from official telemetry on one shared clock. Cars are
 * placed by their distance along the circuit centre-line plus a lateral
 * offset, both map-matched on the server against the same centre-line the
 * scene draws, so they always drive on the road.
 */
export class ReplaySource implements RaceSource {
  readonly drivers: StandingDriver[];
  private readonly cars: ReplayCar[];
  private readonly byId: Map<string, ReplayCar>;
  private readonly sampleCount: number;
  private elapsed = 0;

  constructor(
    private readonly session: ReplaySession,
    private readonly centerline: Centerline,
  ) {
    this.cars = session.drivers.map((columns, index) => ({ driver: toStandingDriver(columns, index), columns }));
    this.drivers = this.cars.map((car) => car.driver);
    this.byId = new Map(this.cars.map((car) => [car.driver.id, car]));
    const lengths = session.drivers.map((d) => d.progress.length);
    this.sampleCount = lengths.length > 0 ? Math.min(...lengths) : 0;
  }

  tick(dt: number): void {
    this.elapsed = clampClock(this.elapsed + dt, this.session.durationSeconds);
  }

  seek(seconds: number): void {
    this.elapsed = clampClock(seconds, this.session.durationSeconds);
  }

  pose(driverId: string): DriverPose | null {
    const car = this.byId.get(driverId);
    if (!car) return null;
    const cursor = this.cursor();
    const { columns } = car;
    const distance = this.centerline.fromProgress(lerpAt(columns.progress, cursor));
    const placement = this.centerline.place(distance, lerpAt(columns.lateral, cursor));
    return {
      x: placement.x,
      y: placement.y,
      z: placement.z,
      headingY: Math.atan2(placement.tangentX, placement.tangentZ),
      status: carStatusOf(columns.status[cursor.index]),
    };
  }

  standings(): DriverStanding[] {
    const cursor = this.cursor();
    return this.cars
      .map((car) => this.standingOf(car, cursor))
      .sort((a, b) => a.position - b.position);
  }

  timing(): RaceTiming {
    const { session } = this;
    return {
      clock: this.elapsed,
      lightsOut: session.lightsOutSeconds,
      durationSeconds: session.durationSeconds,
      ended: this.elapsed >= session.durationSeconds,
      sessionKind: session.sessionKind,
      lap: session.sessionKind === 'race' ? this.leaderLap() : null,
      totalLaps: session.totalLaps,
    };
  }

  private standingOf(car: ReplayCar, cursor: SampleCursor): DriverStanding {
    const { columns } = car;
    const laps = lapSummary(columns.laps, this.elapsed);
    return {
      driver: car.driver,
      position: columns.position[cursor.index] ?? this.cars.length,
      gapSeconds: nullableLerpAt(columns.gap, cursor),
      speedKmh: Math.round(lerpAt(columns.speed, cursor)),
      lap: currentLap(laps.completed, this.session.totalLaps),
      lastLapSeconds: laps.lastLapSeconds,
      bestLapSeconds: laps.bestLapSeconds,
      status: carStatusOf(columns.status[cursor.index]),
    };
  }

  private leaderLap(): number {
    const index = this.cursor().index;
    const leader = this.cars.find((car) => car.columns.position[index] === 1) ?? this.cars[0];
    const completed = leader ? lapSummary(leader.columns.laps, this.elapsed).completed : 0;
    return currentLap(completed, this.session.totalLaps);
  }

  private cursor(): SampleCursor {
    return sampleCursor(this.elapsed, this.session.sampleInterval, this.sampleCount);
  }
}
