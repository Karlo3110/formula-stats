import type { JSX } from 'react';

import { CIRCUIT_PATH, CIRCUIT_VIEWBOX } from '@/lib/circuit-path';
import type { RaceStatus } from '@/lib/mock/telemetry';

import { Panel } from './Panel';
import { Stat } from './Stat';

interface RaceStatusPanelProps {
  race: RaceStatus;
}

export function RaceStatusPanel({ race }: RaceStatusPanelProps): JSX.Element {
  const delta = `${race.deltaSeconds > 0 ? '+' : ''}${race.deltaSeconds.toFixed(3)}`;

  return (
    <Panel title="Race Status">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/15 font-display text-2xl text-primary ring-1 ring-primary/30">
          P{race.position}
        </span>
        <Stat
          label="Lap"
          value={
            <span className="font-display text-3xl">
              {race.lap}
              <span className="text-muted">/{race.totalLaps}</span>
            </span>
          }
        />
        <svg
          viewBox={CIRCUIT_VIEWBOX}
          className="ml-auto h-16 w-32 text-border"
          fill="none"
          aria-label={`${race.circuit} circuit`}
        >
          <path d={CIRCUIT_PATH} stroke="currentColor" strokeWidth={4} />
          <path
            d={CIRCUIT_PATH}
            stroke="var(--color-primary)"
            strokeWidth={2}
            strokeDasharray="6 240"
          />
        </svg>
      </div>

      <p className="mt-3 text-xs uppercase tracking-widest text-muted">
        {race.circuit} · {race.country}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/50 pt-3">
        <Stat label="Top Lap Speed" value={`${race.topSpeedKmh} km/h`} />
        <Stat
          label="Current Lap"
          value={
            <span>
              {race.currentLap}{' '}
              <span className="text-primary">{delta}</span>
            </span>
          }
        />
        <Stat label="Best Lap" value={race.bestLap} />
      </div>
    </Panel>
  );
}
