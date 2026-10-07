import { useEffect, useMemo, type JSX } from 'react';
import * as THREE from 'three';

import type { Centerline } from '@/lib/race/centerline';
import type { TrackCorner } from '@/lib/race/corners';
import { buildRibbon, stretchSpine } from '@/lib/race/ribbon';

interface KerbsProps {
  centerline: Centerline;
  corners: ReadonlyArray<TrackCorner>;
  trackWidth: number;
}

const KERB_WIDTH = 0.11;
const STRIPE_LENGTH = 0.32;
const SAMPLES_PER_STRIPE = 2;
const KERB_LIFT = 0.006;
const KERB_RED = 0xd3202a;
const KERB_WHITE = 0xf2f2f2;
// Kerbs run a little before and after the bend itself.
const KERB_EXTENSION = 0.6;

/** Red and white kerbs on the inside of every bend and on the outside at the exit. */
export function Kerbs({ centerline, corners, trackWidth }: KerbsProps): JSX.Element {
  const geometries = useMemo(() => {
    const half = trackWidth / 2;
    const stripe = trackWidth * STRIPE_LENGTH;
    const step = stripe / SAMPLES_PER_STRIPE;
    const colorAt = (distance: number): number => (Math.floor(distance / stripe) % 2 === 0 ? KERB_RED : KERB_WHITE);
    const extension = trackWidth * KERB_EXTENSION;
    return corners.flatMap((corner) => {
      const inside = corner.inside * (half + (trackWidth * KERB_WIDTH) / 2);
      const insideKerb = stretchSpine(corner.start - extension, corner.end + extension, step, inside);
      const exitKerb = stretchSpine(corner.apex, corner.end + extension * 2, step, -inside);
      const options = { inner: (-trackWidth * KERB_WIDTH) / 2, outer: (trackWidth * KERB_WIDTH) / 2, lift: KERB_LIFT, colorAt };
      return [buildRibbon(centerline, insideKerb, options), buildRibbon(centerline, exitKerb, options)];
    });
  }, [centerline, corners, trackWidth]);

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  return (
    <group>
      {geometries.map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry}>
          <meshStandardMaterial vertexColors roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
