'use client';

import type { JSX } from 'react';

import { Panel } from '@/components/ui/Panel';
import { Eyebrow } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';
import type { DriverStanding } from '@/lib/race/types';

import { SpeedGauge } from './SpeedGauge';

interface FocusStatProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning';
}

function FocusStat({ label, value, tone = 'default' }: FocusStatProps): JSX.Element {
  return (
    <div className="min-w-0">
      <Eyebrow>{label}</Eyebrow>
      <p
        className={cn(
          'mt-1 truncate font-mono text-sm tabular-nums',
          tone === 'warning' ? 'text-warning' : 'text-heading',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FocusEmpty(): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-4 py-4">
      <p className="text-sm font-medium text-foreground">No driver selected</p>
      <p className="text-sm text-muted">
        Pick a car on track or a name in the running order to follow it.
      </p>
    </div>
  );
}

function FocusBody({ standing }: { standing: DriverStanding }): JSX.Element {
  const { driver } = standing;
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <span aria-hidden className="mt-1 h-10 w-1 rounded-sm" style={{ backgroundColor: driver.color }} />
        <div className="min-w-0">
          <p className="font-display text-3xl uppercase leading-none text-heading">{driver.code}</p>
          <p className="mt-1 truncate text-xs text-muted">{driver.team}</p>
        </div>
        <p className="ml-auto font-display text-3xl leading-none text-accent">P{standing.position}</p>
      </div>
      <SpeedGauge speedKmh={standing.speedKmh} />
      <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
        <FocusStat
          label="Gap to leader"
          value={standing.position === 1 ? 'Leader' : `+${standing.gapSeconds.toFixed(2)} s`}
        />
        <FocusStat
          label="Status"
          value={standing.onTrack ? 'On track' : 'Run-off'}
          tone={standing.onTrack ? 'default' : 'warning'}
        />
      </div>
    </div>
  );
}

/** Telemetry for the followed driver: position, speed, gap and track status. */
export function DriverFocusPanel({ isReady }: { isReady: boolean }): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const clearSelection = useRaceStore((state) => state.clearSelection);
  const standing = isReady ? standings.find((s) => s.driver.id === selectedDriverId) : undefined;

  const aside = standing ? (
    <button
      type="button"
      onClick={clearSelection}
      className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
    >
      Clear
    </button>
  ) : null;

  return (
    <Panel title="Driver" aside={aside}>
      {standing ? <FocusBody standing={standing} /> : <FocusEmpty />}
    </Panel>
  );
}
