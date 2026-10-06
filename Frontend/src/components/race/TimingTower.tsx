'use client';

import type { JSX } from 'react';

import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';
import type { DriverStanding } from '@/lib/race/types';

import { TimingTowerSkeleton } from './TimingTowerSkeleton';

const LEADER_LABEL = 'Leader';

function gapLabel(standing: DriverStanding): string {
  return standing.position === 1 ? LEADER_LABEL : `+${standing.gapSeconds.toFixed(1)}`;
}

interface TowerRowProps {
  standing: DriverStanding;
  isSelected: boolean;
  onSelect: (driverId: string) => void;
}

function TowerRow({ standing, isSelected, onSelect }: TowerRowProps): JSX.Element {
  const { driver } = standing;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(driver.id)}
        aria-pressed={isSelected}
        className={cn(
          'relative flex h-9 w-full items-center gap-3 px-4 text-left transition-colors focus-visible:bg-white/[0.06] focus-visible:outline-none',
          isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
        )}
      >
        {isSelected ? <span aria-hidden className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" /> : null}
        <span className="w-5 text-right font-mono text-xs tabular-nums text-muted">
          {standing.position}
        </span>
        <span aria-hidden className="h-4 w-1 rounded-sm" style={{ backgroundColor: driver.color }} />
        <span className="text-sm font-semibold tracking-wide text-foreground">{driver.code}</span>
        {standing.onTrack ? null : (
          <span className="rounded-sm bg-warning/15 px-1 font-mono text-[0.6rem] uppercase text-warning">
            Off
          </span>
        )}
        <span
          className={cn(
            'ml-auto font-mono text-xs tabular-nums',
            standing.position === 1 ? 'text-accent' : 'text-muted',
          )}
        >
          {gapLabel(standing)}
        </span>
      </button>
    </li>
  );
}

/** Live running order; selecting a row follows that car in the 3D scene. */
export function TimingTower({ isReady }: { isReady: boolean }): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);
  const hasRows = isReady && standings.length > 0;

  return (
    <Panel className="h-full" title="Running order" aside={<span className="font-mono text-[0.65rem] text-muted">Gap</span>}>
      {hasRows ? (
        <ol className="h-full overflow-y-auto py-1">
          {standings.map((standing) => (
            <TowerRow
              key={standing.driver.id}
              standing={standing}
              isSelected={standing.driver.id === selectedDriverId}
              onSelect={selectDriver}
            />
          ))}
        </ol>
      ) : (
        <TimingTowerSkeleton />
      )}
    </Panel>
  );
}
