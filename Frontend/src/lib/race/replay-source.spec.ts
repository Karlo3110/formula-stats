import { describe, expect, it } from 'vitest';

import type { ReplayDriver } from '@/lib/validation/f1-schemas';

import { ReplaySource } from './replay-source';

const DURATION = 10;

// Sample layout: [t, x, y, elevation, speedKmh, position, progressMetres, onTrack]
function createDriver(code: string, rows: number[][]): ReplayDriver {
  return { code, team: 'Team', color: '#ffffff', samples: rows };
}

const LEADER = createDriver('AAA', [
  [0, 0, 0, 0, 100, 1, 50, 1],
  [10, 10, 0, 0, 300, 1, 150, 1],
]);
const CHASER = createDriver('BBB', [
  [0, 0, 0, 0, 100, 2, 40, 1],
  [10, 8, 0, 0, 280, 2, 110, 0],
]);

function createSource(): ReplaySource {
  return new ReplaySource([CHASER, LEADER], DURATION, 2);
}

describe('ReplaySource', () => {
  describe('tick', () => {
    it('holds at the end of the window instead of looping', () => {
      const source = createSource();

      source.tick(DURATION + 5);

      expect(source.timing()).toEqual({ clock: DURATION, lightsOut: 2, durationSeconds: DURATION, ended: true });
    });
  });

  describe('seek', () => {
    it('jumps to the requested time and clears the ended state', () => {
      const source = createSource();
      source.tick(DURATION);

      source.seek(5);

      expect(source.timing()).toEqual({ clock: 5, lightsOut: 2, durationSeconds: DURATION, ended: false });
    });

    it('interpolates car poses at the new time', () => {
      const source = createSource();

      source.seek(5);

      expect(source.pose('AAA')?.x).toBe(5);
    });
  });

  describe('standings', () => {
    it('orders cars by official position regardless of input order', () => {
      expect(createSource().standings().map((row) => row.driver.code)).toEqual(['AAA', 'BBB']);
    });

    it('reports the leader with no gap and the chaser behind', () => {
      const [leader, chaser] = createSource().standings();

      expect([leader?.gapSeconds, (chaser?.gapSeconds ?? 0) > 0]).toEqual([0, true]);
    });

    it('surfaces the on-track flag from telemetry', () => {
      const source = createSource();

      source.seek(DURATION);

      expect(source.standings().find((row) => row.driver.code === 'BBB')?.onTrack).toBe(false);
    });
  });
});
