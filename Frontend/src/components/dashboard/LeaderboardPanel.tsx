import type { JSX } from 'react';

import type { TrackCar } from '@/lib/mock/telemetry';

import { Panel } from './Panel';

interface LeaderboardPanelProps {
  cars: TrackCar[];
}

export function LeaderboardPanel({ cars }: LeaderboardPanelProps): JSX.Element {
  return (
    <Panel title="Running Order">
      <ol className="flex flex-col gap-1.5">
        {cars.map((car, index) => (
          <li
            key={car.id}
            className="flex items-center gap-3 rounded-md bg-elevated/40 px-3 py-2"
          >
            <span className="w-5 font-display text-lg text-muted">{index + 1}</span>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: car.color }}
            />
            <span className="font-semibold tabular-nums text-foreground">
              #{car.label}
            </span>
            <span className="ml-auto text-xs uppercase tracking-wider text-muted">
              {car.id}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
