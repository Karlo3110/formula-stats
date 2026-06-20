import { useFrame } from '@react-three/fiber';

import type { RaceSource } from '@/lib/race/types';

const MAX_DELTA = 0.1;

/** Advances the active race source once per frame, before cars/camera read it. */
export function Ticker({ source }: { source: RaceSource }): null {
  useFrame((_, delta) => {
    source.tick(Math.min(delta, MAX_DELTA));
  });
  return null;
}
