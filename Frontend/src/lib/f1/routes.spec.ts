import { describe, expect, it } from 'vitest';

import { SessionCode } from './race-archive';
import { historySeasonHref, raceReplayHref, raceResultHref } from './routes';

describe('raceReplayHref', () => {
  it('omits the session for the main race', () => {
    expect(raceReplayHref({ season: 2025, round: 7 })).toBe('/race?season=2025&round=7');
  });

  it('includes the sprint session identifier', () => {
    expect(raceReplayHref({ season: 2025, round: 6, session: SessionCode.Sprint })).toBe(
      '/race?season=2025&round=6&session=S',
    );
  });
});

describe('raceResultHref', () => {
  it('adds the session only for the sprint', () => {
    expect([raceResultHref(2025, 6), raceResultHref(2025, 6, SessionCode.Sprint)]).toEqual([
      '/history/2025/6',
      '/history/2025/6?session=S',
    ]);
  });
});

describe('archive hrefs', () => {
  it('builds the race result and season URLs', () => {
    expect([raceResultHref(2024, 3), historySeasonHref(2024)]).toEqual(['/history/2024/3', '/history?season=2024']);
  });
});
