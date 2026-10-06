import { sessionStatus, type SessionStatus } from '@/lib/race-weekend';
import type { WeekendEvent, WeekendSchedule } from '@/lib/validation/f1-schemas';

/** FastF1 session identifiers the replay and results endpoints accept. */
export const SessionCode = {
  Race: 'R',
  Sprint: 'S',
} as const;

export type SessionCode = (typeof SessionCode)[keyof typeof SessionCode];

const SESSION_NAMES: Record<SessionCode, string> = {
  R: 'Race',
  S: 'Sprint',
};

const SESSION_CODES: ReadonlyArray<SessionCode> = [SessionCode.Race, SessionCode.Sprint];

export function sessionName(code: SessionCode): string {
  return SESSION_NAMES[code];
}

export function parseSessionCode(value: string | undefined): SessionCode {
  return value === SessionCode.Sprint ? SessionCode.Sprint : SessionCode.Race;
}

function sessionStart(event: WeekendEvent, code: SessionCode): Date | null {
  const session = event.sessions.find((s) => s.name === SESSION_NAMES[code]);
  return session?.startUtc ? new Date(session.startUtc) : null;
}

/** Whether the weekend schedule includes the given session (e.g. a Sprint). */
export function hasSession(event: WeekendEvent, code: SessionCode): boolean {
  return event.sessions.some((session) => session.name === SESSION_NAMES[code]);
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

/**
 * Sessions of an event that have finished and can therefore be replayed or
 * classified. Only sessions present in the schedule are offered — asking
 * FastF1 for a Sprint on a non-sprint weekend is an upstream error.
 */
export function finishedSessions(event: WeekendEvent, now: Date): SessionCode[] {
  return SESSION_CODES.filter((code) => {
    const start = sessionStart(event, code);
    return start !== null && sessionStatus(start, now) === 'done';
  });
}

export function findEvent(
  schedule: WeekendSchedule | undefined,
  round: number,
): WeekendEvent | null {
  return schedule?.events.find((event) => event.roundNumber === round) ?? null;
}
