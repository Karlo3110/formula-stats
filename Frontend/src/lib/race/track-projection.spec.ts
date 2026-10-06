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

    expect(projectTrack(wide, 100, 0)?.project(0, 0)).toEqual({ x: 0, y: 25 });
  });

  it('reads legacy [x, y] points without elevation', () => {
    const legacy = SQUARE.map(([x, , z]) => [x ?? 0, z ?? 0]);

    expect(projectTrack(legacy, 100, 10)?.path).toBe(projectTrack(SQUARE, 100, 10)?.path);
  });

  it('exposes the start/finish point (first outline point)', () => {
    expect(projectTrack(SQUARE, 100, 10)?.start).toEqual({ x: 10, y: 10 });
  });

  it('closes the path', () => {
    expect(projectTrack(SQUARE, 100, 10)?.path.endsWith('Z')).toBe(true);
  });

  it('returns null for an unusable outline', () => {
    expect(projectTrack([[0, 0, 0]], 100, 10)).toBeNull();
  });
});
