import type { JSX } from 'react';

import type { Weather } from '@/lib/mock/telemetry';

import { Panel } from './Panel';
import { Stat } from './Stat';

interface WeatherPanelProps {
  weather: Weather;
}

export function WeatherPanel({ weather }: WeatherPanelProps): JSX.Element {
  return (
    <Panel title="Weather">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        <Stat label="Air Temp" value={`${weather.airTempC.toFixed(1)}°C`} />
        <Stat label="Cloud Cover" value={`${weather.cloudCoverPct}%`} />
        <Stat label="Humidity" value={`${weather.humidityPct}%`} />
        <Stat label="Pressure" value={`${weather.pressureMb} mb`} />
        <Stat label="Wind Speed" value={`${weather.windSpeedKmh.toFixed(2)} km/h`} />
      </div>
    </Panel>
  );
}
