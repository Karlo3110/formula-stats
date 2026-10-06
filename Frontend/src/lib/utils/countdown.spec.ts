import { describe, expect, it } from 'vitest';

import { computeCountdown } from './countdown';

const NOW = Date.UTC(2026, 9, 6, 9, 0, 0);

describe('computeCountdown', () => {
  it('splits the remaining time into days, hours, minutes and seconds', () => {
    const target = NOW + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;

    expect(computeCountdown(target, NOW)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      isPast: false,
    });
  });

  it('reports a passed target as elapsed', () => {
    expect(computeCountdown(NOW - 1000, NOW).isPast).toBe(true);
  });

  it('treats a missing target as elapsed', () => {
    expect(computeCountdown(null, NOW).isPast).toBe(true);
  });
});
