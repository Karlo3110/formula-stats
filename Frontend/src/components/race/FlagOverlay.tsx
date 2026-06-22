'use client';

import type { CSSProperties, JSX } from 'react';

import { useRaceClock } from '@/hooks/use-race-clock';
import { activeFlag } from '@/lib/race/messages';
import type { ReplayMessage } from '@/lib/validation/f1-schemas';

interface FlagStyle {
  color: string;
  label: string;
}

const FLAG_STYLES: Record<string, FlagStyle> = {
  YELLOW: { color: '#f5c518', label: 'Yellow Flag' },
  'DOUBLE YELLOW': { color: '#f5c518', label: 'Double Yellow' },
  RED: { color: '#e8002d', label: 'Red Flag' },
};

export function FlagOverlay({
  messages,
}: {
  messages: ReadonlyArray<ReplayMessage>;
}): JSX.Element | null {
  const timing = useRaceClock();
  if (!timing || messages.length === 0) {
    return null;
  }

  const active = activeFlag(messages, timing.clock);
  if (!active) {
    return null;
  }

  const style = FLAG_STYLES[active.flag] ?? FLAG_STYLES.YELLOW;
  if (!style) {
    return null;
  }
  const scope =
    active.scope && active.scope.toLowerCase() !== 'track' ? active.scope : null;
  const wrapStyle: CSSProperties = {
    color: style.color,
    backgroundColor: `${style.color}22`,
    borderColor: `${style.color}88`,
  };

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-md"
      style={wrapStyle}
    >
      <span
        className="h-2.5 w-2.5 animate-pulse rounded-sm"
        style={{ backgroundColor: style.color }}
      />
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.25em]">
        {style.label}
      </span>
      {scope ? (
        <span className="text-[0.7rem] uppercase tracking-[0.2em] opacity-70">
          {scope}
        </span>
      ) : null}
    </div>
  );
}
