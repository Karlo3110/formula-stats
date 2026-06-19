import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';

interface MeterBarProps {
  value: number;
  max: number;
  /** Tailwind gradient classes for the fill, e.g. "from-primary to-destructive". */
  gradient?: string;
  ticks?: number[];
  formatTick?: (tick: number) => string;
}

export function MeterBar({
  value,
  max,
  gradient = 'from-primary/70 to-primary',
  ticks,
  formatTick = (tick): string => tick.toLocaleString(),
}: MeterBarProps): JSX.Element {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="flex flex-col gap-1">
      <div className="h-3 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {ticks ? (
        <div className="flex justify-between text-[0.6rem] tabular-nums text-muted">
          {ticks.map((tick) => (
            <span key={tick}>{formatTick(tick)}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
