'use client';

import { useCallback, useEffect, useState } from 'react';

import { readTiming } from '@/lib/race/active-source';
import type { RaceTiming } from '@/lib/race/types';

const POLL_INTERVAL_MS = 100;

export interface PolledRaceClock {
  timing: RaceTiming | null;
  /** Re-reads the clock immediately (e.g. right after a seek). */
  refresh: () => void;
}

/** Polls the active race source's playback clock (10 Hz) for synced overlays. */
export function usePolledRaceClock(): PolledRaceClock {
  const [timing, setTiming] = useState<RaceTiming | null>(null);
  const refresh = useCallback((): void => setTiming(readTiming()), []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { timing, refresh };
}

export function useRaceClock(): RaceTiming | null {
  return usePolledRaceClock().timing;
}
