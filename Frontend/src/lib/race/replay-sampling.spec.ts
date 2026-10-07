import { describe, expect, it } from 'vitest';

import { currentLap, lapSummary, lerpAt, nullableLerpAt, sampleCursor } from './replay-sampling';
import { CarStatus } from './types';
import { carStatusOf } from './replay-sampling';

describe('sampleCursor', () => {
  it('finds the samples either side of the clock', () => {
    expect(sampleCursor(2.5, 1, 10)).toEqual({ index: 2, next: 3, frac: 0.5 });
  });

  it('holds on the last sample past the end', () => {
    expect(sampleCursor(99, 2, 5)).toEqual({ index: 4, next: 4, frac: 0 });
  });
});

describe('lerpAt / nullableLerpAt', () => {
  const cursor = sampleCursor(0.25, 1, 2);

  it('interpolates numeric columns', () => {
    expect(lerpAt([100, 200], cursor)).toBe(125);
  });

  it('falls back to the nearer value when a neighbour is missing', () => {
    expect([nullableLerpAt([1, null], cursor), nullableLerpAt([null, 4], cursor)]).toEqual([1, null]);
  });
});

describe('lapSummary', () => {
  const laps: ReadonlyArray<readonly [number, number | null]> = [
    [90, 90],
    [170, 80.5],
    [255, null],
  ];

  it('counts laps finished by the clock with the latest and best times', () => {
    expect(lapSummary(laps, 260)).toEqual({ completed: 3, lastLapSeconds: null, bestLapSeconds: 80.5 });
  });

  it('ignores laps still in progress', () => {
    expect(lapSummary(laps, 100)).toEqual({ completed: 1, lastLapSeconds: 90, bestLapSeconds: 90 });
  });
});

describe('currentLap', () => {
  it('never exceeds the race distance', () => {
    expect([currentLap(0, 57), currentLap(57, 57), currentLap(12, null)]).toEqual([1, 57, 13]);
  });
});

describe('carStatusOf', () => {
  it('maps server status codes', () => {
    expect([0, 1, 2, 7].map(carStatusOf)).toEqual([CarStatus.Running, CarStatus.Pit, CarStatus.Out, CarStatus.Running]);
  });
});
