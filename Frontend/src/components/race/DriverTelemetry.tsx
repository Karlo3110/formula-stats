'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';

interface FocusStatProps {
  label: string;
  value: string;
  accent?: boolean;
}

function FocusStat({ label, value, accent = false }: FocusStatProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.55rem] uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
      <span
        className={cn(
          'font-display text-2xl tabular-nums',
          accent ? 'text-primary' : 'text-heading',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DriverTelemetry(): JSX.Element | null {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);

  const standing = standings.find((s) => s.driver.id === selectedDriverId);
  if (!standing) {
    return null;
  }

  const { driver } = standing;

  return (
    <div className="glass-panel w-full rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-9 w-1 rounded-full"
          style={{ backgroundColor: driver.color }}
        />
        <div className="min-w-0">
          <h2 className="font-display text-4xl uppercase leading-none text-heading">
            {driver.code}
          </h2>
          <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            {driver.name}
          </p>
        </div>
        <span className="ml-auto font-display text-3xl text-primary">
          P{standing.position}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <FocusStat label="km/h" value={`${standing.speedKmh}`} accent />
        <FocusStat
          label="Gap"
          value={standing.position === 1 ? 'LDR' : `+${standing.gapSeconds.toFixed(1)}`}
        />
        <FocusStat label="Lap" value={`${standing.lap}`} />
      </div>

      <p className="mt-4 text-[0.55rem] uppercase tracking-[0.2em] text-muted">
        {driver.team}
      </p>
    </div>
  );
}
