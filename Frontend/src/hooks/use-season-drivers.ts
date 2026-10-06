'use client';

import { useQuery } from '@tanstack/react-query';

import { f1Keys } from '@/lib/api/f1-keys';
import type { DriverProfile, SeasonDrivers } from '@/lib/validation/f1-schemas';
import { f1Service } from '@/services/f1.service';

const SIX_HOURS_MS = 21_600_000;

export type DriverDirectory = ReadonlyMap<string, DriverProfile>;

const EMPTY_DIRECTORY: DriverDirectory = new Map();

function toDirectory(data: SeasonDrivers): DriverDirectory {
  return new Map(data.drivers.map((driver) => [driver.code, driver]));
}

/**
 * Driver profiles (headshot, number, nationality) for a season, keyed by
 * three-letter code. Purely decorative: an empty map while loading or on
 * failure, so callers always render and simply fall back to initials.
 */
export function useSeasonDrivers(season: number | null): DriverDirectory {
  const { data } = useQuery({
    queryKey: f1Keys.seasonDrivers(season ?? 0),
    queryFn: () => f1Service.getSeasonDrivers(season ?? 0),
    select: toDirectory,
    staleTime: SIX_HOURS_MS,
    retry: 1,
    enabled: season !== null,
  });
  return data ?? EMPTY_DIRECTORY;
}
