'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';
import type { DriverStanding } from '@/lib/race/types';

import { Panel } from '@/components/dashboard/Panel';

function gapLabel(standing: DriverStanding): string {
  return standing.position === 1
    ? 'LEADER'
    : `+${standing.gapSeconds.toFixed(1)}s`;
}

export function DriverList(): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);

  return (
    <Panel title="Running Order" contentClassName="p-2">
      <ul className="flex flex-col gap-1">
        {standings.map((standing) => {
          const isSelected = standing.driver.id === selectedDriverId;
          return (
            <li key={standing.driver.id}>
              <button
                type="button"
                onClick={() => selectDriver(standing.driver.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition',
                  isSelected
                    ? 'bg-primary/15 ring-1 ring-primary/40'
                    : 'hover:bg-elevated/60',
                )}
              >
                <span className="w-5 text-center font-display text-lg text-muted">
                  {standing.position}
                </span>
                <span
                  className="h-6 w-1 rounded-full"
                  style={{ backgroundColor: standing.driver.color }}
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wide text-foreground">
                    {standing.driver.code}
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted">
                    {standing.driver.team}
                  </span>
                </span>
                <span className="ml-auto text-xs tabular-nums text-muted">
                  {gapLabel(standing)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
