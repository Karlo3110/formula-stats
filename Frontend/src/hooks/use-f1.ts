'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { f1Keys } from '@/lib/api/f1-keys';
import { getCurrentSeason } from '@/lib/f1/seasons';
import {
  findFeaturedEvent,
  findLatestCompletedRace,
  findNextSession,
  type UpcomingSession,
} from '@/lib/race-weekend';
import { f1Service } from '@/services/f1.service';
import type {
  ReplaySession,
  SeasonSchedule,
  SeasonStandings,
  SessionResults,
  TrackMap,
  WeekendEvent,
  WeekendSchedule,
} from '@/lib/validation/f1-schemas';

const ONE_HOUR_MS = 3_600_000;
const ONE_DAY_MS = 86_400_000;

interface QueryOptions {
  enabled?: boolean;
}

export function useSeasonEvents(season: number): UseQueryResult<SeasonSchedule> {
  return useQuery({
    queryKey: f1Keys.seasonEvents(season),
    queryFn: () => f1Service.getSeasonEvents(season),
    staleTime: ONE_HOUR_MS,
  });
}

export function useSessionResults(
  season: number,
  round: number,
  session: string,
): UseQueryResult<SessionResults> {
  return useQuery({
    queryKey: f1Keys.sessionResults(season, round, session),
    queryFn: () => f1Service.getSessionResults(season, round, session),
    staleTime: ONE_HOUR_MS,
  });
}

export function useSchedule(
  season: number,
  options: QueryOptions = {},
): UseQueryResult<WeekendSchedule> {
  return useQuery({
    queryKey: f1Keys.schedule(season),
    queryFn: () => f1Service.getSchedule(season),
    staleTime: ONE_HOUR_MS,
    enabled: options.enabled ?? true,
  });
}

export function useSeasonStandings(
  season: number,
  options: QueryOptions = {},
): UseQueryResult<SeasonStandings> {
  return useQuery({
    queryKey: f1Keys.standings(season),
    queryFn: () => f1Service.getStandings(season),
    staleTime: ONE_HOUR_MS,
    enabled: options.enabled ?? true,
  });
}

export function useTrackMap(
  season: number,
  round: number,
  session: string,
): UseQueryResult<TrackMap> {
  return useQuery({
    queryKey: f1Keys.trackMap(season, round, session),
    queryFn: () => f1Service.getTrackMap(season, round, session),
    staleTime: ONE_DAY_MS,
    retry: 1,
  });
}

export function useReplay(
  season: number,
  round: number,
  session: string,
  options: QueryOptions = {},
): UseQueryResult<ReplaySession> {
  return useQuery({
    queryKey: f1Keys.replay(season, round, session),
    queryFn: () => f1Service.getReplay(season, round, session),
    staleTime: ONE_DAY_MS,
    retry: 1,
    enabled: options.enabled ?? true,
  });
}

export interface CurrentWeekend {
  event: WeekendEvent | null;
  next: UpcomingSession | null;
  isLoading: boolean;
  isError: boolean;
}

/**
 * The weekend to feature on the dashboard: the current season's next/last
 * event, rolling over to next season once the current one has no sessions left.
 */
export function useCurrentWeekend(): CurrentWeekend {
  const season = getCurrentSeason();
  const now = new Date();

  const currentQuery = useSchedule(season);
  const currentHasUpcoming =
    currentQuery.data != null &&
    findNextSession(currentQuery.data, now) !== null;

  const rollOver = currentQuery.isSuccess && !currentHasUpcoming;
  const nextQuery = useSchedule(season + 1, { enabled: rollOver });
  const nextHasUpcoming =
    nextQuery.data != null && findNextSession(nextQuery.data, now) !== null;

  const active =
    rollOver && nextHasUpcoming ? nextQuery.data : currentQuery.data;

  return {
    event: active ? findFeaturedEvent(active, now) : null,
    next: active ? findNextSession(active, now) : null,
    isLoading: currentQuery.isLoading || (rollOver && nextQuery.isLoading),
    isError: currentQuery.isError,
  };
}

export interface LatestStandings {
  data: SeasonStandings | undefined;
  season: number;
  isLoading: boolean;
  isError: boolean;
}

/** The most recent season's standings, falling back a year if the new season hasn't started. */
export function useLatestStandings(): LatestStandings {
  const current = getCurrentSeason();
  const currentQuery = useSeasonStandings(current);
  const currentEmpty =
    currentQuery.isSuccess && currentQuery.data.drivers.length === 0;

  const previousQuery = useSeasonStandings(current - 1, {
    enabled: currentEmpty,
  });

  if (currentEmpty) {
    return {
      data: previousQuery.data,
      season: current - 1,
      isLoading: previousQuery.isLoading,
      isError: previousQuery.isError,
    };
  }

  return {
    data: currentQuery.data,
    season: current,
    isLoading: currentQuery.isLoading,
    isError: currentQuery.isError,
  };
}

export interface LatestRace {
  season: number;
  round: number;
}

/** The most recently completed Grand Prix, falling back to the prior season. */
export function useLatestRace(options: QueryOptions = {}): {
  race: LatestRace | null;
  isLoading: boolean;
} {
  const enabled = options.enabled ?? true;
  const season = getCurrentSeason();
  const now = new Date();

  const currentQuery = useSchedule(season, { enabled });
  const currentLatest = currentQuery.data
    ? findLatestCompletedRace(currentQuery.data, now)
    : null;

  const needPrevious = enabled && currentQuery.isSuccess && !currentLatest;
  const previousQuery = useSchedule(season - 1, { enabled: needPrevious });
  const previousLatest = previousQuery.data
    ? findLatestCompletedRace(previousQuery.data, now)
    : null;

  if (currentLatest) {
    return { race: { season, round: currentLatest.roundNumber }, isLoading: false };
  }
  if (previousLatest) {
    return {
      race: { season: season - 1, round: previousLatest.roundNumber },
      isLoading: false,
    };
  }

  return {
    race: null,
    isLoading: currentQuery.isLoading || (needPrevious && previousQuery.isLoading),
  };
}
