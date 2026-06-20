'use client';

import type { JSX } from 'react';

import { AdSlot } from '@/components/ads/AdSlot';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useLatestStandings } from '@/hooks/use-f1';

import { StandingsTables } from './StandingsTables';

const STANDINGS_AD_SLOT = '0000000000';

export function StandingsView(): JSX.Element {
  const { data, season, isLoading, isError } = useLatestStandings();

  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Championship · {season}
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          Leaderboard
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/65">
          Live drivers’ and constructors’ standings for the current season.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError || !data || data.drivers.length === 0 ? (
        <Text variant="muted" className="mt-10">
          Standings aren’t available right now.
        </Text>
      ) : (
        <div className="mt-12">
          <StandingsTables data={data} />
        </div>
      )}

      <AdSlot slot={STANDINGS_AD_SLOT} className="mt-16" />
    </div>
  );
}
