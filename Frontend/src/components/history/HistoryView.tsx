'use client';

import { useMemo, useState, type JSX } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { StandingsTables } from '@/components/standings/StandingsTables';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import { f1Keys } from '@/lib/api/f1-keys';
import { getPastSeasons } from '@/lib/f1/seasons';
import { useSeasonStandings } from '@/hooks/use-f1';
import { f1Service } from '@/services/f1.service';

// Past-season standings never change, so cache them forever and keep the
// current table on screen while switching years (no spinner flash).
const IMMUTABLE = Number.POSITIVE_INFINITY;

export function HistoryView(): JSX.Element {
  const seasons = useMemo(() => getPastSeasons(), []);
  const [season, setSeason] = useState<number>(() => seasons[0] ?? 0);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, isError } = useSeasonStandings(season, {
    enabled: season > 0,
    staleTime: IMMUTABLE,
    keepPrevious: true,
  });

  function prefetchSeason(year: number): void {
    void queryClient.prefetchQuery({
      queryKey: f1Keys.standings(year),
      queryFn: () => f1Service.getStandings(year),
      staleTime: IMMUTABLE,
    });
  }

  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Season Archive
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          History
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/65">
          Final drivers’ and constructors’ standings from past seasons.
        </p>
      </header>

      {seasons.length === 0 ? (
        <Text variant="muted" className="mt-10">
          No past seasons to show yet.
        </Text>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {seasons.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSeason(year)}
                onMouseEnter={() => prefetchSeason(year)}
                onFocus={() => prefetchSeason(year)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition',
                  season === year
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-pill text-muted hover:text-foreground',
                )}
              >
                {year}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : isError || !data || data.drivers.length === 0 ? (
            <Text variant="muted" className="mt-10">
              Standings for {season} aren’t available right now.
            </Text>
          ) : (
            <div
              className={cn(
                'mt-12 transition-opacity',
                isFetching && 'opacity-60',
              )}
            >
              <StandingsTables data={data} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
