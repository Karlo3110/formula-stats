'use client';

import { useMemo, type JSX } from 'react';

import { CircuitOutline } from '@/components/f1/CircuitOutline';
import { useTrackMap } from '@/hooks/use-f1';
import { projectTrack } from '@/lib/race/track-projection';
import type { SessionCode } from '@/lib/f1/race-archive';

const VIEW_SIZE = 300;
const VIEW_PADDING = 18;

interface CircuitPanelProps {
  season: number;
  round: number;
  session: SessionCode;
  isEnabled: boolean;
}

/** Large glowing circuit outline from the session's fastest lap. */
export function CircuitPanel({ season, round, session, isEnabled }: CircuitPanelProps): JSX.Element | null {
  const { data, isLoading, isError } = useTrackMap(season, round, session, { enabled: isEnabled });
  const projection = useMemo(
    () => (data ? projectTrack(data.track, VIEW_SIZE, VIEW_PADDING) : null),
    [data],
  );

  // The outline is decorative context; if it cannot be produced, show nothing.
  if (isError || (!isLoading && !projection)) {
    return null;
  }
  return (
    <div className="relative aspect-square w-full max-w-md">
      {projection ? (
        <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} className="h-full w-full" role="img" aria-label="Circuit layout">
          <CircuitOutline projection={projection} strokeWidth={3.5} />
        </svg>
      ) : (
        <div className="absolute inset-[12%] animate-pulse rounded-full border border-dashed border-white/10" />
      )}
    </div>
  );
}
