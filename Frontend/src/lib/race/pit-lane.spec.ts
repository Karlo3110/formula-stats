import { describe, expect, it } from 'vitest';

import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import { derivePitLane } from './pit-lane';

const LAP = 100;
const WIDTH = 2;

function pitDriver(progress: number[], lateral: number, overrides: Partial<ReplayDriver> = {}): ReplayDriver {
  return {
    code: 'PIT',
    number: '1',
    team: 'Team',
    color: null,
    progress,
    lateral: progress.map(() => lateral),
    speed: progress.map(() => 70),
    position: progress.map(() => 1),
    gap: progress.map(() => null),
    status: progress.map(() => 1),
    laps: [],
    ...overrides,
  };
}

const range = (from: number, to: number): number[] => Array.from({ length: to - from }, (_, i) => from + i);

describe('derivePitLane', () => {
  it('traces the lane where two cars drove through the pits', () => {
    const lanes = derivePitLane([pitDriver(range(20, 40), -6), pitDriver(range(20, 40), -6)], LAP, WIDTH);

    expect([lanes.length, lanes[0]?.[0]?.lateral, lanes[0]?.length]).toEqual([1, -6, 10]);
  });

  it('keeps a lane that crosses the start/finish line in one piece', () => {
    const progress = range(90, 110);
    const lanes = derivePitLane([pitDriver(progress, 5), pitDriver(progress, 5)], LAP, WIDTH);

    expect([lanes.length, lanes[0]?.[0]?.distance, lanes[0]?.at(-1)?.distance]).toEqual([1, 91, 109]);
  });

  it('ignores stationary cars and cars on the racing line', () => {
    const parked = pitDriver(range(20, 40), -6, { speed: range(20, 40).map(() => 0) });
    const onRoad = pitDriver(range(20, 40), 0.5);

    expect(derivePitLane([parked, parked, onRoad, onRoad], LAP, WIDTH)).toEqual([]);
  });
});
