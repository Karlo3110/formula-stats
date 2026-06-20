'use client';

import Link from 'next/link';
import { useState, type JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Heading, Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import { useSchedule } from '@/hooks/use-f1';

const SEASONS = [2025, 2024, 2023, 2022, 2021] as const;

export function HistoryView(): JSX.Element {
  const [season, setSeason] = useState<number>(2024);
  const { data, isLoading, isError } = useSchedule(season);

  return (
    <div className="mx-auto flex max-w-[80rem] flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Heading level={1} display>
          Race History
        </Heading>
        <Text variant="muted">Pick a season and replay any Grand Prix in 3D.</Text>
      </header>

      <div className="flex flex-wrap gap-2">
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
      ) : isError || !data ? (
        <Text variant="muted">Could not load the {season} calendar.</Text>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.events.map((event) => (
            <Link
              key={event.roundNumber}
              href={`/race?season=${season}&round=${event.roundNumber}&session=R`}
              className="glass-panel group flex flex-col gap-1 rounded-2xl p-5 transition hover:border-primary/40"
            >
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-primary">
                Round {event.roundNumber} · {event.country}
              </span>
              <span className="font-display text-2xl uppercase leading-tight text-heading">
                {event.eventName}
              </span>
              <span className="text-xs text-muted">{event.location}</span>
              <span className="mt-3 text-xs uppercase tracking-[0.2em] text-foreground/70">
                Replay race →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
