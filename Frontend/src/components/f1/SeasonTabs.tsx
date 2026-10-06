'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';

interface SeasonTabsProps {
  seasons: ReadonlyArray<number>;
  active: number;
  onSelect: (season: number) => void;
  /** Called on hover/focus so the season's data can be prefetched. */
  onPreview?: (season: number) => void;
  className?: string;
}

/** Horizontal, scrollable row of season selectors. */
export function SeasonTabs({ seasons, active, onSelect, onPreview, className }: SeasonTabsProps): JSX.Element {
  return (
    <div role="group" aria-label="Season" className={cn('-mx-1 flex gap-1 overflow-x-auto px-1 pb-1', className)}>
      {seasons.map((season) => (
        <button
          key={season}
          type="button"
          onClick={() => onSelect(season)}
          onMouseEnter={() => onPreview?.(season)}
          onFocus={() => onPreview?.(season)}
          aria-pressed={season === active}
          className={cn(
            'shrink-0 rounded-md border px-3 py-1.5 font-mono text-xs tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            season === active
              ? 'border-white/20 bg-white/10 text-heading'
              : 'border-transparent text-muted hover:border-white/10 hover:text-foreground',
          )}
        >
          {season}
        </button>
      ))}
    </div>
  );
}
