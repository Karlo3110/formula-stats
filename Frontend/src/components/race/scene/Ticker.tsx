import { useFrame } from '@react-three/fiber';

import type { RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

const MAX_DELTA = 0.1;

/**
 * Advances the active race source once per frame, before cars/camera read it.
 * Reads playback state imperatively so the Canvas never re-renders for it, and
 * pauses playback when the replay window ends.
 */
export function Ticker({ source }: { source: RaceSource }): null {
  useFrame((_, delta) => {
    const { isPlaying, playbackRate, setPlaying } = useRaceStore.getState();
    if (!isPlaying) return;
    source.tick(Math.min(delta, MAX_DELTA) * playbackRate);
    if (source.timing()?.ended) {
      setPlaying(false);
    }
  });
  return null;
}
