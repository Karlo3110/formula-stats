'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';
import type { DriverStanding } from '@/lib/race/types';

function gapLabel(standing: DriverStanding): string {
  return standing.position === 1
    ? 'LDR'
    : `+${standing.gapSeconds.toFixed(1)}`;
}

export function DriverList(): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="px-4 pb-2 pt-3 text-[0.6rem] uppercase tracking-[0.3em] text-muted">
        Running Order
      </div>
      <ul className="flex-1 overflow-y-auto px-2 pb-2">
        {standings.map((standing) => {
          const isSelected = standing.driver.id === selectedDriverId;
          return (
            <li key={standing.driver.id}>
              <button
                type="button"
                onClick={() => selectDriver(standing.driver.id)}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition',
                  isSelected ? 'bg-primary/15' : 'hover:bg-white/5',
                )}
              >
                <span
                  className={cn(
                    'w-4 text-right font-display text-base tabular-nums',
                    isSelected ? 'text-primary' : 'text-muted',
                  )}
                >
                  {standing.position}
                </span>
                <span
                  className="h-5 w-[3px] rounded-full"
                  style={{ backgroundColor: standing.driver.color }}
                />
                <span
                  className={cn(
                    'text-sm font-semibold tracking-wide',
                    isSelected ? 'text-foreground' : 'text-foreground/85',
                  )}
                >
                  {standing.driver.code}
                </span>
                <span className="ml-auto text-[0.7rem] tabular-nums text-muted">
                  {gapLabel(standing)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
