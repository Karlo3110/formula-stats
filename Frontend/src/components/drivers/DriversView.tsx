'use client';

import { useState, type JSX } from 'react';

import { AdSlot } from '@/components/ads/AdSlot';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import { useSeasonStandings } from '@/hooks/use-f1';

import { DriverStatCard } from './DriverStatCard';

const DRIVERS_AD_SLOT = '0000000000';

const SEASONS = [2025, 2024, 2023, 2022, 2021] as const;

export function DriversView(): JSX.Element {
  const [season, setSeason] = useState<number>(2024);
  const { data, isLoading, isError } = useSeasonStandings(season);

  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Drivers
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          The grid
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/65">
          Every driver’s championship season at a glance.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {SEASONS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSeason(year)}
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
          Driver data for {season} isn’t available right now.
        </Text>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.drivers.map((driver) => (
            <DriverStatCard key={driver.position} driver={driver} />
          ))}
        </div>
      )}

      <AdSlot slot={DRIVERS_AD_SLOT} className="mt-16" />
    </div>
  );
}
