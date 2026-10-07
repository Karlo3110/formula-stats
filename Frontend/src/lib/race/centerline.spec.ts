import { describe, expect, it } from 'vitest';

import { Centerline } from './centerline';
import { toScenePoint } from './scene-coords';

// A 100 x 100 square in circuit space, driven anticlockwise (east, north, west, south).
const SQUARE = [
  [0, 0, 0],
  [100, 0, 0],
  [100, 0, 100],
  [0, 0, 100],
].map(toScenePoint);

function rounded(value: number): number {
  return Math.round(value * 1000) / 1000;
}

describe('toScenePoint', () => {
  it('negates circuit north so the scene is not mirrored', () => {
    expect([toScenePoint([10, 2, 30]), toScenePoint([10, 30])]).toEqual([
      { x: 10, y: 2, z: -30 },
      { x: 10, y: 0, z: -30 },
    ]);
  });
});

describe('Centerline', () => {
  const centerline = new Centerline(SQUARE);

  it('measures the closed lap including the closing segment', () => {
    expect(centerline.length).toBe(400);
  });

  it('places a car by distance along the line', () => {
    const placement = centerline.place(150, 0);

    expect([rounded(placement.x), rounded(placement.z)]).toEqual([100, -50]);
  });

  it('wraps cumulative progress from later laps onto the same lap', () => {
    const [first, third] = [centerline.place(30, 0), centerline.place(830, 0)];

    expect([rounded(third.x), rounded(third.z)]).toEqual([rounded(first.x), rounded(first.z)]);
  });

  it('offsets positive lateral to the left of travel, as the server does', () => {
    // Heading east along the bottom edge, "left" is north (scene -z).
    const placement = centerline.place(50, 5);

    expect([rounded(placement.x), rounded(placement.z)]).toEqual([50, -5]);
  });

  it('wraps replay progress by the server lap length, not the rounded outline', () => {
    const scaled = new Centerline(SQUARE, 400.4);

    expect(rounded(scaled.fromProgress(400.4 * 60 + 200.2))).toBe(200);
  });

  it('rejects outlines too short to form a circuit', () => {
    expect(() => new Centerline(SQUARE.slice(0, 2))).toThrow();
  });
});
