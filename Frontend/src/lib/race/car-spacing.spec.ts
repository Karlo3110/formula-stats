import { describe, expect, it } from 'vitest';

import { separateAlongside, type RoadSlot, type SpacingRoad } from './car-spacing';

const ROAD: SpacingRoad = { car: { length: 4, width: 1 }, halfWidth: 3, lapLength: 1000 };
const REQUIRED = 1.2;

function separation(slots: RoadSlot[]): number {
  const [a, b] = separateAlongside(slots, ROAD);
  return Math.abs((b ?? 0) - (a ?? 0));
}

describe('separateAlongside', () => {
  it('moves two cars sharing one spot side by side', () => {
    expect(separation([{ id: 1, distance: 100, lateral: 0 }, { id: 2, distance: 100.5, lateral: 0 }])).toBeCloseTo(REQUIRED);
  });

  it('keeps each car on the side it was already on', () => {
    const [inside, outside] = separateAlongside(
      [{ id: 3, distance: 100, lateral: -0.1 }, { id: 4, distance: 101, lateral: 0.1 }],
      ROAD,
    );

    expect([Math.sign(inside ?? 0), Math.sign(outside ?? 0)]).toEqual([-1, 1]);
  });

  it('leaves a car clearly ahead in its own line', () => {
    expect(separateAlongside([{ id: 5, distance: 100, lateral: 0 }, { id: 6, distance: 110, lateral: 0 }], ROAD)).toEqual([0, 0]);
  });

  it('treats cars either side of the start/finish line as alongside', () => {
    expect(separation([{ id: 7, distance: 999.5, lateral: 0 }, { id: 8, distance: 0.5, lateral: 0 }])).toBeCloseTo(REQUIRED);
  });

  it('keeps both cars on the road, pushing the one with room', () => {
    const laterals = separateAlongside([{ id: 9, distance: 100, lateral: 2.5 }, { id: 10, distance: 100, lateral: 2.5 }], ROAD);

    expect([Math.max(...laterals.map(Math.abs)) <= 2.5, Math.abs((laterals[1] ?? 0) - (laterals[0] ?? 0))]).toEqual([
      true,
      expect.closeTo(REQUIRED),
    ]);
  });
});
