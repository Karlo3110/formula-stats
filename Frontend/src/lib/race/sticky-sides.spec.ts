import { describe, expect, it } from 'vitest';

import { separateAlongside, type RoadSlot, type SpacingRoad } from './car-spacing';
import { StickySides } from './sticky-sides';

const ROAD: SpacingRoad = { car: { length: 4, width: 1 }, halfWidth: 3, lapLength: 1000 };

function frame(sides: StickySides, slots: RoadSlot[]): number[] {
  sides.beginFrame();
  const laterals = separateAlongside(slots, ROAD, sides);
  sides.endFrame();
  return laterals;
}

describe('StickySides', () => {
  it('keeps a pair on its sides when GPS noise swaps their lateral order', () => {
    const sides = new StickySides();
    frame(sides, [{ id: 1, distance: 100, lateral: -0.1 }, { id: 2, distance: 101, lateral: 0.1 }]);

    const [first, second] = frame(sides, [{ id: 1, distance: 101, lateral: 0.1 }, { id: 2, distance: 101.5, lateral: -0.1 }]);

    expect((first ?? 0) < (second ?? 0)).toBe(true);
  });

  it('answers the same whichever car of the pair is listed first', () => {
    const sides = new StickySides();
    frame(sides, [{ id: 1, distance: 100, lateral: -0.1 }, { id: 2, distance: 100, lateral: 0.1 }]);

    const [second, first] = frame(sides, [{ id: 2, distance: 100, lateral: 0 }, { id: 1, distance: 100, lateral: 0 }]);

    expect((first ?? 0) < (second ?? 0)).toBe(true);
  });

  it('decides afresh once the cars have separated', () => {
    const sides = new StickySides();
    frame(sides, [{ id: 1, distance: 100, lateral: -0.1 }, { id: 2, distance: 100, lateral: 0.1 }]);
    frame(sides, [{ id: 1, distance: 100, lateral: 0 }, { id: 2, distance: 200, lateral: 0 }]);

    const [first, second] = frame(sides, [{ id: 1, distance: 300, lateral: 0.1 }, { id: 2, distance: 300, lateral: -0.1 }]);

    expect((first ?? 0) > (second ?? 0)).toBe(true);
  });
});
