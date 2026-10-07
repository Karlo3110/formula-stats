import { describe, expect, it } from 'vitest';

import { clampClock, formatLapTime, formatRaceClock } from './playback';

describe('clampClock', () => {
  it('keeps a position inside the window unchanged', () => {
    expect(clampClock(42.5, 96)).toBe(42.5);
  });

  it('holds at the end instead of wrapping past the duration', () => {
    expect(clampClock(120, 96)).toBe(96);
  });

  it('floors negative and non-finite input at zero', () => {
    expect([clampClock(-3, 96), clampClock(Number.NaN, 96)]).toEqual([0, 0]);
  });
});

describe('formatRaceClock', () => {
  it('counts down to lights out with a leading minus', () => {
    expect(formatRaceClock(2, 6)).toBe('-00:04');
  });

  it('shows minutes and seconds since lights out', () => {
    expect(formatRaceClock(6 + 75.9, 6)).toBe('01:15');
  });

  it('reads zero exactly at lights out', () => {
    expect(formatRaceClock(6, 6)).toBe('00:00');
  });
});

describe('formatRaceClock for long sessions', () => {
  it('adds hours past the hour mark', () => {
    expect(formatRaceClock(10 + 3725, 10)).toBe('1:02:05');
  });
});

describe('formatLapTime', () => {
  it('formats laps over and under a minute', () => {
    expect([formatLapTime(83.4561), formatLapTime(62.05), formatLapTime(58.1234)]).toEqual([
      '1:23.456',
      '1:02.050',
      '58.123',
    ]);
  });
});
