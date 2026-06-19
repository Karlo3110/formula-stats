import type { JSX } from 'react';

import type { PowerUnit } from '@/lib/mock/telemetry';

import { Panel } from './Panel';
import { MeterBar } from './MeterBar';

const ENGINE_MAX_C = 140;
const RPM_TICKS = [0, 4000, 8000, 12000];

interface PowerUnitPanelProps {
  powerUnit: PowerUnit;
}

export function PowerUnitPanel({ powerUnit }: PowerUnitPanelProps): JSX.Element {
  return (
    <Panel title="Power Unit">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
            <span>RPM</span>
            <span className="tabular-nums text-foreground">
              {powerUnit.rpm.toLocaleString()}
            </span>
          </div>
          <MeterBar
            value={powerUnit.rpm}
            max={powerUnit.rpmMax}
            gradient="from-primary via-warning to-destructive"
            ticks={RPM_TICKS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
            <span>Engine Temp</span>
            <span className="tabular-nums text-foreground">{powerUnit.engineTempC}°C</span>
          </div>
          <MeterBar
            value={powerUnit.engineTempC}
            max={ENGINE_MAX_C}
            gradient="from-warning to-destructive"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted">
            <span>Fuel</span>
            <span className="tabular-nums text-foreground">{powerUnit.fuelPct}%</span>
          </div>
          <MeterBar value={powerUnit.fuelPct} max={100} gradient="from-primary/60 to-primary" />
        </div>
      </div>
    </Panel>
  );
}
