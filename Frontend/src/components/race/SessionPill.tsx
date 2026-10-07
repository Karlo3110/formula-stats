'use client';

import type { JSX } from 'react';

import { useRaceClock } from '@/hooks/use-race-clock';
import type { RaceTiming } from '@/lib/race/types';

function progressLabel(timing: RaceTiming | null): string | null {
  if (!timing || timing.lap === null) return null;
  return timing.totalLaps !== null ? `Lap ${timing.lap}/${timing.totalLaps}` : `Lap ${timing.lap}`;
}

/** Which session is playing, with the race lap counter. */
export function SessionPill({ sessionName }: { sessionName: string }): JSX.Element {
  const progress = progressLabel(useRaceClock());

  return (
    <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
      {sessionName}
      {progress ? <span className="tabular-nums text-heading">{progress}</span> : null}
    </span>
  );
}
