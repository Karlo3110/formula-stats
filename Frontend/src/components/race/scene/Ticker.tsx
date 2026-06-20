import { useFrame } from '@react-three/fiber';

import { raceEngine } from '@/lib/race/race-engine';

const MAX_DELTA = 0.1;

/** Advances the race simulation once per frame, before cars/camera read it. */
export function Ticker(): null {
  useFrame((_, delta) => {
    raceEngine.tick(Math.min(delta, MAX_DELTA));
  });
  return null;
}
