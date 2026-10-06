'use client';

import { useEffect, useState } from 'react';

import { computeCountdown, type Countdown } from '@/lib/utils/countdown';

const TICK_MS = 1000;

/**
 * Live countdown to a target date, ticking every second. Derived during render
 * from a ticking clock, so a caller passing a fresh-but-equal Date each render
 * cannot trigger an update loop.
 */
export function useCountdown(target: Date | null): Countdown {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return computeCountdown(target?.getTime() ?? null, now);
}
