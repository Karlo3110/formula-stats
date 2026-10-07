import { describe, expect, it } from 'vitest';

import type { ReplayDriver, ReplaySession } from '@/lib/validation/f1-schemas';

import { Centerline } from './centerline';
import { ReplaySource } from './replay-source';
import { toScenePoint } from './scene-coords';
import { CarStatus } from './types';

const DURATION = 4;
const SQUARE = new Centerline(
  [
    [0, 0, 0],
    [100, 0, 0],
    [100, 0, 100],
    [0, 0, 100],
  ].map(toScenePoint),
);

function createDriver(overrides: Partial<ReplayDriver> & Pick<ReplayDriver, 'code'>): ReplayDriver {
  return {
    number: '1',
    team: 'Team',
    color: '#ffffff',
    progress: [0, 100, 200, 300, 400],
    lateral: [0, 0, 0, 0, 0],
    speed: [100, 200, 300, 300, 300],
    position: [1, 1, 1, 1, 1],
    gap: [0, 0, 0, 0, 0],
    status: [0, 0, 0, 0, 0],
    laps: [],
    ...overrides,
  };
}

function createSession(overrides: Partial<ReplaySession> = {}): ReplaySession {
  return {
    season: 2026,
    roundNumber: 14,
    session: 'R',
    sessionName: 'Race',
    sessionKind: 'race',
    durationSeconds: DURATION,
    sampleInterval: 1,
    lightsOutSeconds: 1,
    totalLaps: 2,
    trackWidth: 2,
    lapLength: SQUARE.length,
    track: [],
    drivers: [
      createDriver({ code: 'BBB', position: [2, 2, 2, 2, 2], gap: [null, 1.5, 2, 2.5, 3], status: [0, 0, 1, 1, 2] }),
      createDriver({ code: 'AAA', laps: [[3.5, 88.2]] }),
    ],
    messages: [],
    ...overrides,
  };
}

function sourceAt(clock: number, session: ReplaySession = createSession()): ReplaySource {
  const source = new ReplaySource(session, SQUARE);
  source.seek(clock);
  return source;
}

describe('ReplaySource', () => {
  it('holds at the end of the window instead of looping', () => {
    const source = sourceAt(0);
    source.tick(DURATION + 5);

    expect([source.timing().clock, source.timing().ended]).toEqual([DURATION, true]);
  });

  it('places cars on the centre-line by interpolated progress', () => {
    const pose = sourceAt(1.5).pose('AAA');

    expect([pose?.x, pose?.z]).toEqual([100, -50]);
  });

  it('orders the tower by the server position and interpolates gaps', () => {
    const rows = sourceAt(1.5).standings();

    expect(rows.map((row) => [row.driver.code, row.gapSeconds])).toEqual([
      ['AAA', 0],
      ['BBB', 1.75],
    ]);
  });

  it('reports pit and retirement status per sample', () => {
    const statuses = [2, 4].map((clock) => sourceAt(clock).pose('BBB')?.status);

    expect(statuses).toEqual([CarStatus.Pit, CarStatus.Out]);
  });

  it('counts the leader’s laps for the race lap counter', () => {
    expect([sourceAt(3).timing().lap, sourceAt(4).timing().lap]).toEqual([1, 2]);
  });

  it('has no lap counter or start lights outside a race', () => {
    const timing = sourceAt(2, createSession({ sessionKind: 'qualifying', lightsOutSeconds: null })).timing();

    expect([timing.lap, timing.lightsOut]).toEqual([null, null]);
  });
});
