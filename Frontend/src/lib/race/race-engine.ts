import { CarStatus, type DriverStanding, type RaceDriver } from './types';

/**
 * Lightweight client-side race simulation standing in for live FastF1 position
 * data. The 3D scene advances it once per frame via tick(); side panels read
 * standings() at a low rate. Replace progress updates with interpolated FastF1
 * position telemetry when the live feed is wired.
 */

export const RACE_DRIVERS: ReadonlyArray<RaceDriver> = [
  { id: 'VER', code: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#3671C6', baseLapSeconds: 13.8 },
  { id: 'HAM', code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#27F4D2', baseLapSeconds: 13.9 },
  { id: 'LEC', code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#E8002D', baseLapSeconds: 13.95 },
  { id: 'NOR', code: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#FF8000', baseLapSeconds: 13.85 },
  { id: 'RUS', code: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#27F4D2', baseLapSeconds: 14.05 },
  { id: 'SAI', code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#E8002D', baseLapSeconds: 14.0 },
  { id: 'PIA', code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8000', baseLapSeconds: 13.92 },
  { id: 'PER', code: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#3671C6', baseLapSeconds: 14.1 },
  { id: 'ALO', code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#229971', baseLapSeconds: 14.15 },
  { id: 'GAS', code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', color: '#0093CC', baseLapSeconds: 14.25 },
];

const SPEED_WAVE = 0.05;
const BASE_SPEED_KMH = 300;

class RaceEngine {
  private readonly progress: number[];
  private elapsed = 0;

  constructor(private readonly drivers: ReadonlyArray<RaceDriver>) {
    this.progress = drivers.map((_, index) => -index * 0.008);
  }

  tick(dt: number): void {
    this.elapsed += dt;
    this.drivers.forEach((driver, index) => {
      const wave = 1 + SPEED_WAVE * Math.sin(this.elapsed * 0.25 + index * 1.3);
      const lapsPerSecond = 1 / driver.baseLapSeconds;
      this.progress[index] = (this.progress[index] ?? 0) + lapsPerSecond * wave * dt;
    });
  }

  trackT(driverId: string): number {
    const index = this.drivers.findIndex((d) => d.id === driverId);
    const value = this.progress[index] ?? 0;
    return ((value % 1) + 1) % 1;
  }

  standings(): DriverStanding[] {
    const ordered = this.drivers
      .map((driver, index) => ({ driver, value: this.progress[index] ?? 0, index }))
      .sort((a, b) => b.value - a.value);

    const leaderValue = ordered[0]?.value ?? 0;

    return ordered.map((entry, position) => {
      const wave = 1 + SPEED_WAVE * Math.sin(this.elapsed * 0.25 + entry.index * 1.3);
      return {
        driver: entry.driver,
        position: position + 1,
        gapSeconds: (leaderValue - entry.value) * entry.driver.baseLapSeconds,
        speedKmh: Math.round(BASE_SPEED_KMH * wave),
        lap: Math.max(1, Math.floor(entry.value) + 1),
        lastLapSeconds: null,
        bestLapSeconds: null,
        status: CarStatus.Running,
      };
    });
  }
}

export const raceEngine = new RaceEngine(RACE_DRIVERS);
