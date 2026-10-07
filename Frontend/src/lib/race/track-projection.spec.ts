import { describe, expect, it } from 'vitest';

import { projectTrack } from './track-projection';

const SQUARE: number[][] = [
  [-10, 0, -10],
  [10, 0, -10],
  [10, 0, 10],
  [-10, 0, 10],
];

describe('projectTrack', () => {
  it('fits the outline inside the padded viewBox', () => {
    const projection = projectTrack(SQUARE, 100, 10);

    expect([projection?.project(-10, -10), projection?.project(10, 10)]).toEqual([
      { x: 10, y: 10 },
      { x: 90, y: 90 },
    ]);
  });

  it('centres the short axis of a non-square circuit', () => {
    const wide = [
      [0, 0, 0],
      [40, 0, 0],
      [40, 0, 20],
      [0, 0, 20],
    ];

    // Scene z is negated circuit north, so the northern edge (z = -20) is the top.
    expect(projectTrack(wide, 100, 0)?.project(0, -20)).toEqual({ x: 0, y: 25 });
  });

  it('reads legacy [x, y] points without elevation', () => {
    const legacy = SQUARE.map(([x, , z]) => [x ?? 0, z ?? 0]);

    expect(projectTrack(legacy, 100, 10)?.path).toBe(projectTrack(SQUARE, 100, 10)?.path);
  });

  it('exposes the start/finish point (first outline point), north up', () => {
    // [-10, 0, -10] is the south-west corner of the circuit: bottom-left.
    expect(projectTrack(SQUARE, 100, 10)?.start).toEqual({ x: 10, y: 90 });
  });

  it('closes the path', () => {
    expect(projectTrack(SQUARE, 100, 10)?.path.endsWith('Z')).toBe(true);
  });

  it('returns null for an unusable outline', () => {
    expect(projectTrack([[0, 0, 0]], 100, 10)).toBeNull();
  });
});
