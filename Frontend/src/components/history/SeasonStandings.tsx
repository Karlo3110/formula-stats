'use client';

import type { JSX } from 'react';

import { StandingsTables } from '@/components/standings/StandingsTables';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useSeasonStandings } from '@/hooks/use-f1';
import { useSeasonDrivers } from '@/hooks/use-season-drivers';
import { getCurrentSeason } from '@/lib/f1/seasons';

// Completed seasons never change, so their standings can be cached forever.
const IMMUTABLE = Number.POSITIVE_INFINITY;

/** Championship standings for one season: final for past years, live for the current one. */
export function SeasonStandings({ season }: { season: number }): JSX.Element {
  const isPastSeason = season < getCurrentSeason();
  const { data, isLoading, isError } = useSeasonStandings(
    season,
    isPastSeason ? { staleTime: IMMUTABLE } : {},
  );
  const drivers = useSeasonDrivers(season);

  return (
    <section aria-labelledby="standings-heading" className="mt-20">
      <h2 id="standings-heading" className="font-display text-3xl uppercase text-heading">
        {isPastSeason ? 'Final standings' : 'Standings so far'}
      </h2>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex min-h-[16rem] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError || !data || data.drivers.length === 0 ? (
          <Text variant="muted">Standings for {season} aren’t available right now.</Text>
        ) : (
          <StandingsTables data={data} drivers={drivers} />
        )}
      </div>
    </section>
  );
}
