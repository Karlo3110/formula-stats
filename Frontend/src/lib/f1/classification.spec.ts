import { describe, expect, it } from 'vitest';

import type { DriverResult } from '@/lib/validation/f1-schemas';

import {
  isClassifiedFinish,
  podiumOf,
  sortByPosition,
  splitDriverName,
  summarizeClassification,
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
