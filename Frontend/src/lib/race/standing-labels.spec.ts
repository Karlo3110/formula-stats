import { describe, expect, it } from 'vitest';

import { focusGapLabel, lapTimeLabel, towerGapLabel } from './standing-labels';
import { CarStatus, type DriverStanding } from './types';

function createStanding(overrides: Partial<DriverStanding> = {}): DriverStanding {
  return {
    driver: { id: 'NOR', code: 'NOR', name: 'NOR', team: 'McLaren', color: '#ff8000' },
    position: 2,
    gapSeconds: 1.234,
    speedKmh: 290,
    lap: 12,
    lastLapSeconds: 81.2,
    bestLapSeconds: 80.5,
    status: CarStatus.Running,
    ...overrides,
  };
}

describe('towerGapLabel', () => {
  it('shows the leader and race gaps to a tenth', () => {
    expect([
      towerGapLabel(createStanding({ position: 1, gapSeconds: 0 }), 'race'),
      towerGapLabel(createStanding(), 'race'),
    ]).toEqual(['Leader', '+1.2']);
  });

  it('shows the fastest lap time, then gaps to a thousandth, outside races', () => {
    expect([
      towerGapLabel(createStanding({ position: 1, gapSeconds: 0, bestLapSeconds: 72.345 }), 'qualifying'),
      towerGapLabel(createStanding(), 'practice'),
      towerGapLabel(createStanding({ gapSeconds: null, bestLapSeconds: null }), 'practice'),
    ]).toEqual(['1:12.345', '+1.234', 'No time']);
  });

  it('marks retired cars instead of a gap', () => {
    expect(towerGapLabel(createStanding({ status: CarStatus.Out }), 'race')).toBe('Out');
  });
});

describe('focusGapLabel / lapTimeLabel', () => {
  it('formats the detailed race gap and missing lap times', () => {
    expect([focusGapLabel(createStanding(), 'race'), lapTimeLabel(null), lapTimeLabel(80.5)]).toEqual([
      '+1.23 s',
      '—',
      '1:20.500',
    ]);
  });
});
