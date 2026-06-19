import type { JSX } from 'react';

import { MOCK_TELEMETRY } from '@/lib/mock/telemetry';

import { DriverCard } from './DriverCard';
import { PowerUnitPanel } from './PowerUnitPanel';
import { RaceStatusPanel } from './RaceStatusPanel';
import { SessionResultsPanel } from './SessionResultsPanel';
import { TirePanel } from './TirePanel';
import { TrackView } from './TrackView';
import { WeatherPanel } from './WeatherPanel';

const LATEST_SEASON = 2024;
const FEATURED_ROUND = 1;
const FEATURED_SESSION = 'R';

export function DashboardView(): JSX.Element {
  const data = MOCK_TELEMETRY;

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs uppercase tracking-wider text-warning">
          Demo data — live telemetry coming soon
        </p>
        <DriverCard driver={data.driver} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <RaceStatusPanel race={data.race} />
          <WeatherPanel weather={data.weather} />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <TrackView circuit={data.race.circuit} cars={data.cars} />
          <PowerUnitPanel powerUnit={data.powerUnit} />
        </div>

        <div className="flex flex-col gap-4">
          <TirePanel tires={data.tires} />
          <SessionResultsPanel
            season={LATEST_SEASON}
            round={FEATURED_ROUND}
            session={FEATURED_SESSION}
          />
        </div>
      </div>
    </div>
  );
}
