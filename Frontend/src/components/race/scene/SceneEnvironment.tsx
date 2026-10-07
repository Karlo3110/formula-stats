import { useMemo, type JSX } from 'react';

import type { Centerline } from '@/lib/race/centerline';
import { groundHeight } from '@/lib/race/scene-coords';

import { createGrassTexture } from './scene-textures';

const SKY = '#0e1418';
const GROUND_SIZE = 3000;
// One texture repeat per ~20 world units keeps the mowing stripes readable.
const GRASS_REPEAT = GROUND_SIZE / 20;
export const GRASS_TINT = '#8fae84';

/** Evening-race lighting, sky and the grass the circuit sits in. */
export function SceneEnvironment({ centerline }: { centerline: Centerline }): JSX.Element {
  const grass = useMemo(() => {
    const texture = createGrassTexture();
    texture?.repeat.set(GRASS_REPEAT, GRASS_REPEAT);
    return texture;
  }, []);

  return (
    <>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 420, 1500]} />
      <hemisphereLight args={['#c9d6e3', '#22301f', 0.8]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[160, 260, 90]} intensity={1.5} color="#fff4e0" />
      <mesh rotation-x={-Math.PI / 2} position={[0, groundHeight(centerline.points), 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color={GRASS_TINT} map={grass} roughness={1} metalness={0} />
      </mesh>
    </>
  );
}
