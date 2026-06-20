'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { f1Keys } from '@/lib/api/f1-keys';
import { f1Service } from '@/services/f1.service';
import type {
  ReplaySession,
  SeasonSchedule,
  SessionResults,
  TrackMap,
} from '@/lib/validation/f1-schemas';

const ONE_HOUR_MS = 3_600_000;
const ONE_DAY_MS = 86_400_000;

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
): UseQueryResult<ReplaySession> {
  return useQuery({
    queryKey: f1Keys.replay(season, round, session),
    queryFn: () => f1Service.getReplay(season, round, session),
    staleTime: ONE_DAY_MS,
    retry: 1,
  });
}
