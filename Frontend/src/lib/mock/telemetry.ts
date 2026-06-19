/**
 * Placeholder telemetry for the dashboard UI. Replaced by live data from the
 * backend (FastF1 + WebSockets) in a later pass — do not depend on these shapes
 * as the API contract.
 */

export type TireCorner = 'FL' | 'FR' | 'RL' | 'RR';

export interface TireReading {
  corner: TireCorner;
  tempC: number;
  pressureBar: number;
  brakeTempC: number;
}

export interface RaceStatus {
  position: number;
  lap: number;
  totalLaps: number;
  circuit: string;
  country: string;
  topSpeedKmh: number;
  currentLap: string;
  deltaSeconds: number;
  bestLap: string;
}

export interface DriverInfo {
  firstInitial: string;
  lastName: string;
  number: number;
  team: string;
}

export interface Weather {
  airTempC: number;
  cloudCoverPct: number;
  humidityPct: number;
  pressureMb: number;
  windSpeedKmh: number;
}

export interface PowerUnit {
  rpm: number;
  rpmMax: number;
  engineTempC: number;
  fuelPct: number;
}

export interface TrackCar {
  id: string;
  label: string;
  color: string;
  /** Animation offset 0-1 around the circuit. */
  startOffset: number;
  lapSeconds: number;
}

export interface Telemetry {
  race: RaceStatus;
  driver: DriverInfo;
  weather: Weather;
  tires: TireReading[];
  powerUnit: PowerUnit;
  cars: TrackCar[];
}

export const MOCK_TELEMETRY: Telemetry = {
  race: {
    position: 1,
    lap: 16,
    totalLaps: 67,
    circuit: 'Hockenheim',
    country: 'Germany',
    topSpeedKmh: 287,
    currentLap: '1:21.52',
    deltaSeconds: -1.075,
    bestLap: '1:23.05',
  },
  driver: { firstInitial: 'L', lastName: 'Hamilton', number: 44, team: 'Mercedes-AMG Petronas' },
  weather: {
    airTempC: 23.4,
    cloudCoverPct: 13,
    humidityPct: 75,
    pressureMb: 650,
    windSpeedKmh: 7,
  },
  tires: [
    { corner: 'FL', tempC: 104, pressureBar: 1.2, brakeTempC: 650 },
    { corner: 'FR', tempC: 105, pressureBar: 1.1, brakeTempC: 500 },
    { corner: 'RL', tempC: 113, pressureBar: 1.2, brakeTempC: 765 },
    { corner: 'RR', tempC: 115, pressureBar: 1.3, brakeTempC: 725 },
  ],
  powerUnit: { rpm: 9200, rpmMax: 12000, engineTempC: 104, fuelPct: 62 },
  cars: [
    { id: 'HAM', label: '44', color: 'var(--color-primary)', startOffset: 0, lapSeconds: 9 },
    { id: 'VER', label: '1', color: 'oklch(0.7 0.2 260)', startOffset: 0.12, lapSeconds: 9.2 },
    { id: 'LEC', label: '16', color: 'oklch(0.62 0.21 25)', startOffset: 0.27, lapSeconds: 9.4 },
    { id: 'NOR', label: '4', color: 'var(--color-warning)', startOffset: 0.55, lapSeconds: 9.6 },
    { id: 'RUS', label: '63', color: 'var(--color-foreground)', startOffset: 0.78, lapSeconds: 9.3 },
  ],
};
