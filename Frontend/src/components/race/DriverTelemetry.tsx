'use client';

import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Typography';
import { Panel } from '@/components/dashboard/Panel';
import { Stat } from '@/components/dashboard/Stat';
import { useStandings } from '@/hooks/use-standings';
import { useRaceStore } from '@/stores/use-race-store';

export function DriverTelemetry(): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const clearSelection = useRaceStore((state) => state.clearSelection);

  const standing = standings.find((s) => s.driver.id === selectedDriverId);

  if (!standing) {
    return (
      <Panel title="Driver Focus">
        <Text variant="muted">
          Tap a car on the track or a name in the running order to follow a
          driver.
        </Text>
      </Panel>
    );
  }

  const { driver } = standing;

  return (
    <Panel title="Driver Focus">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-10 w-1.5 rounded-full"
            style={{ backgroundColor: driver.color }}
          />
          <div>
            <h3 className="font-display text-3xl uppercase leading-none text-heading">
              {driver.code}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {driver.name} · {driver.team}
            </p>
          </div>
          <span className="ml-auto font-display text-3xl text-primary">
            P{standing.position}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-3">
          <Stat label="Speed" value={`${standing.speedKmh} km/h`} />
          <Stat
            label="Gap"
            value={standing.position === 1 ? 'Leader' : `+${standing.gapSeconds.toFixed(1)}s`}
          />
          <Stat label="Lap" value={standing.lap} />
        </div>

        <Button variant="secondary" size="sm" onClick={clearSelection}>
          Back to overview
        </Button>
        <Text variant="small">Live position replay · demo data</Text>
      </div>
    </Panel>
  );
}
