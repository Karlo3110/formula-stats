'use client';

import { useCallback } from 'react';

import { seekActiveSource } from '@/lib/race/active-source';
import type { PlaybackRate } from '@/lib/race/playback';
import type { RaceTiming } from '@/lib/race/types';
import { usePolledRaceClock } from '@/hooks/use-race-clock';
import { useRaceStore } from '@/stores/use-race-store';

export interface ReplayPlayback {
  timing: RaceTiming | null;
  isPlaying: boolean;
  rate: PlaybackRate;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setRate: (rate: PlaybackRate) => void;
}

/** Transport controls for the active replay (play/pause, scrub, speed). */
export function useReplayPlayback(): ReplayPlayback {
  const { timing, refresh } = usePolledRaceClock();
  const isPlaying = useRaceStore((state) => state.isPlaying);
  const rate = useRaceStore((state) => state.playbackRate);
  const setPlaying = useRaceStore((state) => state.setPlaying);
  const setRate = useRaceStore((state) => state.setPlaybackRate);
  const isEnded = timing?.ended ?? false;

  const togglePlay = useCallback((): void => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    // Pressing play on a finished replay restarts it from the grid.
    if (isEnded) {
      seekActiveSource(0);
      refresh();
    }
    setPlaying(true);
  }, [isPlaying, isEnded, setPlaying, refresh]);

  // Refresh synchronously so the controlled scrubber already shows the new
  // position when the browser's trailing `change` event fires (keyboard
  // seeking emits `input` then `change`; a stale value would seek back).
  const seek = useCallback(
    (seconds: number): void => {
      seekActiveSource(seconds);
      refresh();
    },
    [refresh],
  );

  return { timing, isPlaying, rate, togglePlay, seek, setRate };
}
