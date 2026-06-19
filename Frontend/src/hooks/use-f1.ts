'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { f1Keys } from '@/lib/api/f1-keys';
import { f1Service } from '@/services/f1.service';
import type { SeasonSchedule, SessionResults } from '@/lib/validation/f1-schemas';

const ONE_HOUR_MS = 3_600_000;

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
