'use client';

import { useEffect, useState } from 'react';

import { readStandings } from '@/lib/race/active-source';
import type { DriverStanding } from '@/lib/race/types';

const POLL_INTERVAL_MS = 250;

/** Polls the active race source at 4 Hz for the side panels. */
export function useStandings(): DriverStanding[] {
  const [standings, setStandings] = useState<DriverStanding[]>([]);

  useEffect(() => {
    const id = setInterval(() => setStandings(readStandings()), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return standings;
}
