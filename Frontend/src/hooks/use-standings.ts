'use client';

import { useEffect, useState } from 'react';

import { raceEngine } from '@/lib/race/race-engine';
import type { DriverStanding } from '@/lib/race/types';

const POLL_INTERVAL_MS = 250;

/** Polls the race engine at 4 Hz for the side panels (the 3D scene runs at 60fps separately). */
export function useStandings(): DriverStanding[] {
  const [standings, setStandings] = useState<DriverStanding[]>(() =>
    raceEngine.standings(),
  );

  useEffect(() => {
    const id = setInterval(() => setStandings(raceEngine.standings()), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return standings;
}
