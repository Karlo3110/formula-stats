import { describe, expect, it } from 'vitest';

import { chaseShot, heliShot, isOutOfRange, nearestCamera, trackSideCameras } from './camera-rig';
import { Centerline } from './centerline';

const LINE = new Centerline([
  { x: 0, y: 0, z: 0 },
  { x: 100, y: 0, z: 0 },
  { x: 100, y: 0, z: -100 },
  { x: 0, y: 0, z: -100 },
]);
const HEADING_EAST = Math.PI / 2;

describe('trackSideCameras', () => {
  it('raises every camera well above the circuit', () => {
    const cameras = trackSideCameras(LINE, [], 2);

    expect(cameras.every((camera) => camera.position.y >= 10)).toBe(true);
  });
});

describe('nearestCamera', () => {
  const cameras = [
    { position: { x: 0, y: 5, z: 0 }, fov: 24 },
    { position: { x: 50, y: 5, z: 0 }, fov: 24 },
  ];

  it('cuts to the closest camera that is not already live', () => {
    expect([nearestCamera(cameras, { x: 5, z: 0 }, -1), nearestCamera(cameras, { x: 5, z: 0 }, 0)]).toEqual([0, 1]);
  });
});

describe('isOutOfRange', () => {
  it('flags a camera that is too far away to film the car', () => {
    const shot = { position: { x: 0, y: 10, z: 0 }, fov: 24 };

    expect([isOutOfRange(shot, { x: 20, z: 0 }, 2), isOutOfRange(shot, { x: 200, z: 0 }, 2)]).toEqual([false, true]);
  });
});

describe('chaseShot / heliShot', () => {
  const car = { x: 10, y: 0, z: 0, headingY: HEADING_EAST };

  it('sits behind the car, above it, and looks ahead of it', () => {
    const shot = chaseShot(car, 2);

    expect([shot.position.x < car.x, shot.position.y > car.y, shot.look.x > car.x]).toEqual([true, true, true]);
  });

  it('puts the helicopter far higher than the chase camera', () => {
    expect(heliShot(car, 2).y).toBeGreaterThan(chaseShot(car, 2).position.y * 10);
  });
});
