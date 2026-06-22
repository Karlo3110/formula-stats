'use client';

import { useEffect, useState } from 'react';

import { readTiming } from '@/lib/race/active-source';
import type { RaceTiming } from '@/lib/race/types';

const POLL_INTERVAL_MS = 100;

/** Polls the active race source's playback clock (10 Hz) for synced overlays. */
export function useRaceClock(): RaceTiming | null {
  const [timing, setTiming] = useState<RaceTiming | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTiming(readTiming()), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return timing;
}
