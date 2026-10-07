'use client';

import type { JSX } from 'react';

import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { towerColumnTitle, towerGapLabel, towerTitle } from '@/lib/race/standing-labels';
import { CarStatus, type DriverStanding } from '@/lib/race/types';
import type { SessionKind } from '@/lib/validation/f1-schemas';
import { useRaceStore } from '@/stores/use-race-store';

import { TimingTowerSkeleton } from './TimingTowerSkeleton';

interface TowerRowProps {
  standing: DriverStanding;
  kind: SessionKind;
  isSelected: boolean;
  onSelect: (driverId: string) => void;
}

function PitChip(): JSX.Element {
  return <span className="rounded-sm bg-warning/15 px-1 font-mono text-[0.6rem] uppercase text-warning">Pit</span>;
}

function TowerRow({ standing, kind, isSelected, onSelect }: TowerRowProps): JSX.Element {
  const { driver } = standing;
  const isOut = standing.status === CarStatus.Out;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(driver.id)}
        aria-pressed={isSelected}
        className={cn(
          'relative flex h-9 w-full items-center gap-3 px-4 text-left transition-colors focus-visible:bg-white/[0.06] focus-visible:outline-none',
          isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
          isOut && 'opacity-45',
        )}
      >
        {isSelected ? <span aria-hidden className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" /> : null}
        <span className="w-5 text-right font-mono text-xs tabular-nums text-muted">{standing.position}</span>
        <span aria-hidden className="h-4 w-1 rounded-sm" style={{ backgroundColor: driver.color }} />
        <span className="text-sm font-semibold tracking-wide text-foreground">{driver.code}</span>
        {standing.status === CarStatus.Pit ? <PitChip /> : null}
        <span
          className={cn(
            'ml-auto font-mono text-xs tabular-nums',
            standing.position === 1 && !isOut ? 'text-accent' : 'text-muted',
          )}
        >
          {towerGapLabel(standing, kind)}
        </span>
      </button>
    </li>
  );
}

interface TimingTowerProps {
  isReady: boolean;
  kind: SessionKind;
}

/** Live order (race) or best-lap timing (qualifying/practice); a row follows that car. */
export function TimingTower({ isReady, kind }: TimingTowerProps): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);
  const hasRows = isReady && standings.length > 0;

  return (
    <Panel
      className="h-full"
      title={towerTitle(kind)}
      aside={<span className="font-mono text-[0.65rem] text-muted">{towerColumnTitle(kind)}</span>}
    >
      {hasRows ? (
        <ol className="h-full overflow-y-auto py-1">
          {standings.map((standing) => (
            <TowerRow
              key={standing.driver.id}
              standing={standing}
              kind={kind}
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
