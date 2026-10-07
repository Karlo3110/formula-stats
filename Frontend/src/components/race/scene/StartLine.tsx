import { useEffect, useMemo, type JSX } from 'react';
import * as THREE from 'three';

import type { Centerline } from '@/lib/race/centerline';
import { buildRibbon, stretchSpine } from '@/lib/race/ribbon';

import { createChequerTexture } from './scene-textures';

const LINE_DEPTH = 0.12;
const LINE_LIFT = 0.006;

/** Chequered start/finish line across the road at the timing line. */
export function StartLine({ centerline, trackWidth }: { centerline: Centerline; trackWidth: number }): JSX.Element {
  const depth = trackWidth * LINE_DEPTH;
  const geometry = useMemo(
    () =>
      buildRibbon(centerline, stretchSpine(-depth / 2, depth / 2, depth, 0), {
        inner: -trackWidth / 2,
        outer: trackWidth / 2,
        lift: LINE_LIFT,
        textureLength: depth,
      }),
    [centerline, trackWidth, depth],
  );
  const chequer = useMemo(() => createChequerTexture(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial map={chequer} roughness={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}
