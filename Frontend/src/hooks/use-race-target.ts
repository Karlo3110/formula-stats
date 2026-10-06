'use client';

import { useLatestRace, useSchedule } from '@/hooks/use-f1';
import {
  SessionCode,
  findEvent,
  finishedSessions,
} from '@/lib/f1/race-archive';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

export interface RaceRequest {
  season?: number;
  round?: number;
  session: SessionCode;
}

export interface RaceTarget {
  season: number;
  round: number;
  session: SessionCode;
}

/** Why there is nothing to replay, when the request cannot be served. */
export type RaceBlocker = 'no-finished-race' | 'unknown-round' | 'not-run-yet';

export interface ResolvedRace {
  /** The race to replay, once known and validated against the schedule. */
  target: RaceTarget | null;
  event: WeekendEvent | null;
  /** Sessions of this event that have finished and can be replayed. */
  sessions: SessionCode[];
  isExplicit: boolean;
  isResolving: boolean;
  blocker: RaceBlocker | null;
}

function pickSession(requested: SessionCode, available: SessionCode[]): SessionCode {
  if (available.length === 0 || available.includes(requested)) return requested;
  return available[0] ?? SessionCode.Race;
}

/**
 * Resolves which race the race center shows: the one in the URL, or the most
 * recent finished Grand Prix. The session is checked against the weekend's
 * schedule first, so a Sprint is never requested on a non-sprint weekend.
 */
export function useRaceTarget(request: RaceRequest): ResolvedRace {
  const isExplicit = request.season !== undefined && request.round !== undefined;
  const latest = useLatestRace({ enabled: !isExplicit });
  const season = isExplicit ? request.season : latest.race?.season;
  const round = isExplicit ? request.round : latest.race?.round;

  const scheduleQuery = useSchedule(season ?? 0, { enabled: season !== undefined });
  const event = round !== undefined ? findEvent(scheduleQuery.data, round) : null;
  const sessions = event ? finishedSessions(event, new Date()) : [];
  const isScheduleSettled = scheduleQuery.isSuccess || scheduleQuery.isError;
  const blocker = findBlocker({
    hasRace: season !== undefined && round !== undefined,
    isLatestLoading: latest.isLoading,
    isScheduleLoaded: scheduleQuery.isSuccess,
    event,
    sessions,
  });

  const target =
    season !== undefined && round !== undefined && isScheduleSettled && !blocker
      ? { season, round, session: pickSession(request.session, sessions) }
      : null;

  return {
    target,
    event,
    sessions,
    isExplicit,
    isResolving: target === null && !blocker,
    blocker,
  };
}

interface BlockerInput {
  hasRace: boolean;
  isLatestLoading: boolean;
  isScheduleLoaded: boolean;
  event: WeekendEvent | null;
  sessions: SessionCode[];
}

function findBlocker(input: BlockerInput): RaceBlocker | null {
  if (!input.hasRace) {
    return input.isLatestLoading ? null : 'no-finished-race';
  }
  if (!input.isScheduleLoaded) return null;
  if (!input.event) return 'unknown-round';
  return input.sessions.length === 0 ? 'not-run-yet' : null;
}
