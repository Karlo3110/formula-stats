import { describe, expect, it } from 'vitest';

import { findLatestCompletedRace } from '@/lib/race-weekend';
import type { WeekendEvent, WeekendSchedule } from '@/lib/validation/f1-schemas';

import {
  SessionCode,
  buildArchive,
  completedRounds,
  defaultSession,
  finishedSessions,
  hasSession,
  parseSessionCode,
  replayableRounds,
  weekendSessions,
} from './race-archive';

const NOW = new Date('2026-10-06T12:00:00Z');
const HOUR_MS = 3_600_000;

function createEvent(round: number, raceIso: string, sprintIso?: string): WeekendEvent {
  return {
    roundNumber: round,
    country: 'Country',
    location: `Location ${round}`,
    eventName: `Grand Prix ${round}`,
    sessions: [
      ...(sprintIso ? [{ name: 'Sprint', startUtc: sprintIso }] : []),
      { name: 'Race', startUtc: raceIso },
    ],
  };
}

function createSchedule(events: WeekendEvent[]): WeekendSchedule {
  return { season: 2026, events };
}

const iso = (offsetHours: number): string => new Date(NOW.getTime() + offsetHours * HOUR_MS).toISOString();

describe('buildArchive', () => {
  it('labels rounds as done, live or upcoming from the race start', () => {
    const schedule = createSchedule([
      createEvent(1, iso(-72)),
      createEvent(2, iso(-1)),
      createEvent(3, iso(240)),
    ]);

    expect(buildArchive(schedule, NOW).map((entry) => entry.status)).toEqual(['done', 'live', 'upcoming']);
  });
});

describe('completedRounds', () => {
  it('lists only finished rounds, newest first', () => {
    const schedule = createSchedule([
      createEvent(1, iso(-400)),
      createEvent(2, iso(-72)),
      createEvent(3, iso(240)),
    ]);

    expect(completedRounds(schedule, NOW).map((entry) => entry.event.roundNumber)).toEqual([2, 1]);
  });
});

describe('finishedSessions', () => {
  it('offers the sprint only on weekends that have one', () => {
    expect(finishedSessions(createEvent(1, iso(-72)), NOW)).toEqual([SessionCode.Race]);
  });

  it('offers a finished sprint before the race has run', () => {
    expect(finishedSessions(createEvent(1, iso(20), iso(-6)), NOW)).toEqual([SessionCode.Sprint]);
  });
});

describe('finishedSessions on a full weekend', () => {
  const weekend: WeekendEvent = {
    roundNumber: 9,
    country: 'Country',
    location: 'Location',
    eventName: 'Grand Prix 9',
    sessions: [
      { name: 'Race', startUtc: iso(20) },
      { name: 'Practice 1', startUtc: iso(-48) },
      { name: 'Qualifying', startUtc: iso(-6) },
      { name: 'Practice 2', startUtc: iso(-44) },
      { name: 'Practice 3', startUtc: iso(-10) },
    ],
  };

  it('lists finished practice and qualifying sessions in running order', () => {
    expect(finishedSessions(weekend, NOW)).toEqual([
      SessionCode.Practice1,
      SessionCode.Practice2,
      SessionCode.Practice3,
      SessionCode.Qualifying,
    ]);
  });

  it('lists every scheduled session, finished or not', () => {
    expect(weekendSessions(weekend, NOW).map((entry) => `${entry.code}:${entry.status}`)).toEqual([
      'FP1:done',
      'FP2:done',
      'FP3:done',
      'Q:done',
      'R:upcoming',
    ]);
  });

  it('defaults to the race, else the latest finished session', () => {
    expect([
      defaultSession(finishedSessions(weekend, NOW)),
      defaultSession([SessionCode.Qualifying, SessionCode.Race]),
      defaultSession([]),
    ]).toEqual([SessionCode.Qualifying, SessionCode.Race, SessionCode.Race]);
  });

  it('counts a weekend in progress as replayable', () => {
    expect(replayableRounds(createSchedule([weekend, createEvent(10, iso(200))]), NOW).map((e) => e.roundNumber)).toEqual([9]);
  });
});

describe('hasSession', () => {
  it('detects a sprint weekend from the schedule', () => {
    expect([
      hasSession(createEvent(1, iso(-72), iso(-96)), SessionCode.Sprint),
      hasSession(createEvent(2, iso(-72)), SessionCode.Sprint),
    ]).toEqual([true, false]);
  });
});

describe('parseSessionCode', () => {
  it('accepts every FastF1 session identifier', () => {
    expect(['FP1', 'FP2', 'FP3', 'SS', 'SQ', 'Q', 'S', 'R'].map(parseSessionCode)).toEqual([
      SessionCode.Practice1,
      SessionCode.Practice2,
      SessionCode.Practice3,
      SessionCode.SprintShootout,
      SessionCode.SprintQualifying,
      SessionCode.Qualifying,
      SessionCode.Sprint,
      SessionCode.Race,
    ]);
  });

  it('defaults unknown or missing identifiers to the race', () => {
    expect([parseSessionCode(undefined), parseSessionCode('fp1'), parseSessionCode('X')]).toEqual([
      SessionCode.Race,
      SessionCode.Race,
      SessionCode.Race,
    ]);
  });
});

describe('findLatestCompletedRace', () => {
  it('skips a race still inside its live window (telemetry not published yet)', () => {
    const schedule = createSchedule([createEvent(17, iso(-170)), createEvent(18, iso(-1))]);

    expect(findLatestCompletedRace(schedule, NOW)?.roundNumber).toBe(17);
  });
});
