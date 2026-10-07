import { sessionStatus, type SessionStatus } from '@/lib/race-weekend';
import type { WeekendEvent, WeekendSchedule } from '@/lib/validation/f1-schemas';

/** FastF1 session identifiers the replay and results endpoints accept. */
export const SessionCode = {
  Practice1: 'FP1',
  Practice2: 'FP2',
  Practice3: 'FP3',
  SprintShootout: 'SS',
  SprintQualifying: 'SQ',
  Qualifying: 'Q',
  Sprint: 'S',
  Race: 'R',
} as const;

export type SessionCode = (typeof SessionCode)[keyof typeof SessionCode];

/** Session names exactly as the FastF1 event schedule spells them. */
const SESSION_NAMES: Record<SessionCode, string> = {
  FP1: 'Practice 1',
  FP2: 'Practice 2',
  FP3: 'Practice 3',
  SS: 'Sprint Shootout',
  SQ: 'Sprint Qualifying',
  Q: 'Qualifying',
  S: 'Sprint',
  R: 'Race',
};

const SESSION_LABELS: Record<SessionCode, string> = {
  FP1: 'FP1',
  FP2: 'FP2',
  FP3: 'FP3',
  SS: 'Shootout',
  SQ: 'Sprint Quali',
  Q: 'Quali',
  S: 'Sprint',
  R: 'Race',
};

const CODE_BY_NAME: ReadonlyMap<string, SessionCode> = new Map(
  (Object.keys(SESSION_NAMES) as SessionCode[]).map((code) => [SESSION_NAMES[code], code]),
);

/** Sessions with a classification page (podium, race time, gaps). */
const RESULT_SESSIONS: ReadonlySet<SessionCode> = new Set([SessionCode.Race, SessionCode.Sprint]);

export function sessionName(code: SessionCode): string {
  return SESSION_NAMES[code];
}

/** Compact label for tabs and chips ("FP1", "Quali"). */
export function sessionLabel(code: SessionCode): string {
  return SESSION_LABELS[code];
}

export function isResultSession(code: SessionCode): boolean {
  return RESULT_SESSIONS.has(code);
}

function isSessionCode(value: string): value is SessionCode {
  return value in SESSION_NAMES;
}

export function parseSessionCode(value: string | undefined): SessionCode {
  return value !== undefined && isSessionCode(value) ? value : SessionCode.Race;
}

function sessionStart(event: WeekendEvent, code: SessionCode): Date | null {
  const session = event.sessions.find((s) => s.name === SESSION_NAMES[code]);
  return session?.startUtc ? new Date(session.startUtc) : null;
}

/** Whether the weekend schedule includes the given session (e.g. a Sprint). */
export function hasSession(event: WeekendEvent, code: SessionCode): boolean {
  return event.sessions.some((session) => session.name === SESSION_NAMES[code]);
}

export interface WeekendSessionEntry {
  code: SessionCode;
  start: Date | null;
  status: SessionStatus;
}

/** Every replayable session of a weekend, in the order they run. */
export function weekendSessions(event: WeekendEvent, now: Date): WeekendSessionEntry[] {
  return event.sessions
    .flatMap((session) => {
      const code = CODE_BY_NAME.get(session.name);
      if (!code) return [];
      const start = session.startUtc ? new Date(session.startUtc) : null;
      return [{ code, start, status: start ? sessionStatus(start, now) : 'upcoming' }];
    })
    .sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity));
}

export interface ArchiveEntry {
  event: WeekendEvent;
  raceStart: Date | null;
  status: SessionStatus;
}

/** Every round of a season with its race date and whether it has been run. */
export function buildArchive(schedule: WeekendSchedule, now: Date): ArchiveEntry[] {
  return schedule.events.map((event) => {
    const raceStart = sessionStart(event, SessionCode.Race);
    return {
      event,
      raceStart,
      status: raceStart ? sessionStatus(raceStart, now) : 'upcoming',
    };
  });
}

/** Rounds whose race has finished, newest first. */
export function completedRounds(schedule: WeekendSchedule, now: Date): ArchiveEntry[] {
  return buildArchive(schedule, now)
    .filter((entry) => entry.status === 'done')
    .reverse();
}

/** Rounds with at least one finished session (a weekend in progress counts), newest first. */
export function replayableRounds(schedule: WeekendSchedule, now: Date): WeekendEvent[] {
  return schedule.events.filter((event) => finishedSessions(event, now).length > 0).reverse();
}

/**
 * Sessions of an event that have finished and can therefore be replayed, in
 * running order. Only sessions present in the schedule are offered — asking
 * FastF1 for a Sprint on a non-sprint weekend is an upstream error.
 */
export function finishedSessions(event: WeekendEvent, now: Date): SessionCode[] {
  return weekendSessions(event, now)
    .filter((entry) => entry.status === 'done')
    .map((entry) => entry.code);
}

/** The session to show when none (or an unavailable one) was asked for. */
export function defaultSession(available: ReadonlyArray<SessionCode>): SessionCode {
  if (available.includes(SessionCode.Race)) return SessionCode.Race;
  return available[available.length - 1] ?? SessionCode.Race;
}

export function findEvent(
  schedule: WeekendSchedule | undefined,
  round: number,
): WeekendEvent | null {
  return schedule?.events.find((event) => event.roundNumber === round) ?? null;
}
