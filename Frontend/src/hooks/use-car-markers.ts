'use client';

import { useEffect, useState } from 'react';

import { readCarMarkers, type CarMarker } from '@/lib/race/active-source';

const POLL_INTERVAL_MS = 80;

/** Polls every car's top-down position (~12 Hz) for the 2D track map. */
export function useCarMarkers(): CarMarker[] {
  const [markers, setMarkers] = useState<CarMarker[]>([]);

  useEffect(() => {
    const id = setInterval(() => setMarkers(readCarMarkers()), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return markers;
}
