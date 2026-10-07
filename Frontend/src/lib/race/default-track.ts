import * as THREE from 'three';

import { Centerline } from './centerline';

/** Track width of the stylised stand-in circuit, world units. */
export const DEFAULT_TRACK_WIDTH = 4;
const DEFAULT_TRACK_SAMPLES = 400;

const CONTROL_POINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, -52],
  [42, 0, -44],
  [58, 1.5, -12],
  [36, 1.5, 12],
  [48, 0, 42],
  [12, 0, 54],
  [-22, 0, 44],
  [-16, 2, 12],
  [-48, 2, 6],
  [-58, 0, -26],
  [-30, 0, -48],
];

/** Stylised circuit shown behind loading/empty states before real data arrives. */
export function createDefaultCenterline(): Centerline {
  const curve = new THREE.CatmullRomCurve3(
    CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,
    'catmullrom',
    0.5,
  );
  return new Centerline(
    curve.getSpacedPoints(DEFAULT_TRACK_SAMPLES).slice(0, -1).map((p) => ({ x: p.x, y: p.y, z: p.z })),
  );
}
