import { describe, expect, it } from 'vitest';

import { Centerline } from './centerline';
import { findCorners } from './corners';

/** A rounded rectangle driven anticlockwise on screen-north-up axes (scene z negated). */
function roundedRectangle(): Centerline {
  const points: { x: number; y: number; z: number }[] = [];
  const add = (x: number, z: number): void => {
    points.push({ x, y: 0, z: -z });
  };
  for (let x = 0; x < 100; x += 1) add(x, 0);
  for (let z = 0; z < 50; z += 1) add(100, z);
  for (let x = 100; x > 0; x -= 1) add(x, 50);
  for (let z = 50; z > 0; z -= 1) add(0, z);
  return new Centerline(points);
}

describe('findCorners', () => {
  it('finds the four bends of a rectangle, all turning left', () => {
    const corners = findCorners(roundedRectangle(), 2);

    expect([corners.length, corners.every((corner) => corner.inside === 1)]).toEqual([4, true]);
  });

  it('brackets each apex with the bend it belongs to', () => {
    const corners = findCorners(roundedRectangle(), 2);

    expect(corners.every((corner) => corner.start < corner.apex && corner.apex < corner.end)).toBe(true);
  });
});
