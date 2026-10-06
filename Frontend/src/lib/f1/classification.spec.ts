import { describe, expect, it } from 'vitest';

import type { DriverResult } from '@/lib/validation/f1-schemas';

import {
  formatRaceDuration,
  gridLabel,
  isClassifiedFinish,
  podiumOf,
  positionsGained,
  sortByPosition,
  splitDriverName,
  summarizeClassification,
  timeOrGapLabel,
} from './classification';

function createResult(overrides: Partial<DriverResult> = {}): DriverResult {
  return {
    position: 1,
    driverNumber: '4',
    abbreviation: 'NOR',
    fullName: 'Lando Norris',
    teamName: 'McLaren',
    points: 25,
    status: 'Finished',
    gridPosition: 2,
    laps: 57,
    timeSeconds: 5504.742,
    teamColor: '#ff8000',
    headshotUrl: null,
    countryCode: 'GBR',
    ...overrides,
  };
}

describe('isClassifiedFinish', () => {
  it.each(['Finished', '+1 Lap', '+2 Laps', 'Lapped'])('treats "%s" as classified', (status) => {
    expect(isClassifiedFinish(createResult({ status }))).toBe(true);
  });

  it.each(['Retired', 'Accident', 'Disqualified', 'Did not start'])('treats "%s" as a non-finish', (status) => {
    expect(isClassifiedFinish(createResult({ status }))).toBe(false);
  });
});

describe('summarizeClassification', () => {
  it('counts starters, classified finishers and retirements', () => {
    const results = [createResult(), createResult({ status: '+1 Lap' }), createResult({ status: 'Retired' })];

    expect(summarizeClassification(results)).toEqual({ starters: 3, classified: 2, retired: 1 });
  });

  it('handles an empty classification', () => {
    expect(summarizeClassification([])).toEqual({ starters: 0, classified: 0, retired: 0 });
  });
});

describe('sortByPosition', () => {
  it('orders by position with unclassified entries last', () => {
    const sorted = sortByPosition([
      createResult({ abbreviation: 'DNS', position: null }),
      createResult({ abbreviation: 'P2', position: 2 }),
      createResult({ abbreviation: 'P1', position: 1 }),
    ]);

    expect(sorted.map((result) => result.abbreviation)).toEqual(['P1', 'P2', 'DNS']);
  });
});

describe('podiumOf', () => {
  it('returns the top three classified positions in order', () => {
    const podium = podiumOf([4, 3, 1, 2].map((position) => createResult({ position, abbreviation: `P${position}` })));

    expect(podium.map((result) => result.abbreviation)).toEqual(['P1', 'P2', 'P3']);
  });
});

describe('splitDriverName', () => {
  it('splits given and family names', () => {
    expect(splitDriverName('Lando Norris')).toEqual({ given: 'Lando', family: 'Norris' });
  });

  it('keeps multi-word family names together', () => {
    expect(splitDriverName('Andrea Kimi Antonelli')).toEqual({ given: 'Andrea', family: 'Kimi Antonelli' });
  });

  it('treats a single name as the family name', () => {
    expect(splitDriverName('Zhou')).toEqual({ given: '', family: 'Zhou' });
  });
});

describe('formatRaceDuration', () => {
  it('formats hours, minutes and milliseconds', () => {
    expect(formatRaceDuration(5504.742)).toBe('1:31:44.742');
  });

  it('omits hours for sprint-length times', () => {
    expect(formatRaceDuration(1832.05)).toBe('30:32.050');
  });
});

describe('timeOrGapLabel', () => {
  const winner = createResult();

  it('shows the total race time for the winner', () => {
    expect(timeOrGapLabel(winner, winner)).toBe('1:31:44.742');
  });

  it('shows the gap to the winner for cars on the lead lap', () => {
    expect(timeOrGapLabel(createResult({ position: 2, timeSeconds: 5510 }), winner)).toBe('+5.258s');
  });

  it('falls back to the status for lapped or retired cars', () => {
    expect(timeOrGapLabel(createResult({ timeSeconds: null, status: '+1 Lap' }), winner)).toBe('+1 Lap');
  });
});

describe('positionsGained', () => {
  it('counts places gained from the grid', () => {
    expect(positionsGained(createResult({ gridPosition: 8, position: 3 }))).toBe(5);
  });

  it('reports places lost as negative', () => {
    expect(positionsGained(createResult({ gridPosition: 1, position: 4 }))).toBe(-3);
  });

  it('ignores pit-lane starts and missing data', () => {
    expect([
      positionsGained(createResult({ gridPosition: 0, position: 10 })),
      positionsGained(createResult({ gridPosition: null })),
      positionsGained(createResult({ position: null })),
    ]).toEqual([null, null, null]);
  });
});

describe('gridLabel', () => {
  it('labels grid slots, pit-lane starts and missing data', () => {
    expect([
      gridLabel(createResult({ gridPosition: 7 })),
      gridLabel(createResult({ gridPosition: 0 })),
      gridLabel(createResult({ gridPosition: null })),
    ]).toEqual(['7', 'PL', '–']);
  });
});
