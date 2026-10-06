import { useId, type JSX } from 'react';

import type { TrackProjection } from '@/lib/race/track-projection';

const GLOW_STD_DEVIATION = 3;

interface CircuitOutlineProps {
  projection: TrackProjection;
  strokeWidth?: number;
}

/**
 * Circuit drawn as a glowing racing line with a start/finish tick. Shared by
 * the live track map and the race archive pages.
 */
export function CircuitOutline({ projection, strokeWidth = 3 }: CircuitOutlineProps): JSX.Element {
  const glowId = useId();
  const { start } = projection;

  return (
    <g>
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={GLOW_STD_DEVIATION} />
        </filter>
      </defs>
      <path d={projection.path} fill="none" stroke="var(--color-primary)" strokeOpacity={0.55} strokeWidth={strokeWidth * 2} filter={`url(#${glowId})`} />
      <path d={projection.path} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <circle cx={start.x} cy={start.y} r={strokeWidth * 1.4} fill="var(--color-accent)" stroke="#0b0b0c" strokeWidth={1} />
    </g>
  );
}
