import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import type { TireReading } from '@/lib/mock/telemetry';

import { Panel } from './Panel';

const HOT_TIRE_C = 112;
const WARM_TIRE_C = 106;

function tempColor(tempC: number): string {
  if (tempC >= HOT_TIRE_C) return 'text-destructive';
  if (tempC >= WARM_TIRE_C) return 'text-warning';
  return 'text-primary';
}

interface TirePanelProps {
  tires: TireReading[];
}

function TireCard({ tire }: { tire: TireReading }): JSX.Element {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border/60 bg-elevated/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {tire.corner} Tire
        </span>
        <span className={cn('text-lg font-semibold tabular-nums', tempColor(tire.tempC))}>
          {tire.tempC}°C
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>Pressure</span>
        <span className="tabular-nums text-foreground">{tire.pressureBar.toFixed(1)} bar</span>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>Brake</span>
        <span className="tabular-nums text-foreground">{tire.brakeTempC}°C</span>
      </div>
    </div>
  );
}

export function TirePanel({ tires }: TirePanelProps): JSX.Element {
  return (
    <Panel title="Tires & Brakes">
      <div className="grid grid-cols-2 gap-3">
        {tires.map((tire) => (
          <TireCard key={tire.corner} tire={tire} />
        ))}
      </div>
    </Panel>
  );
}
