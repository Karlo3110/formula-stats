'use client';

import type { JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Eyebrow, Text } from '@/components/ui/Typography';
import { useSchedule } from '@/hooks/use-f1';
import { buildArchive } from '@/lib/f1/race-archive';

import { RoundCard } from './RoundCard';

/** Grid of every round in a season, finished rounds first-class and clickable. */
export function SeasonCalendar({ season }: { season: number }): JSX.Element {
  const { data, isLoading, isError } = useSchedule(season);

  if (isLoading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (isError || !data || data.events.length === 0) {
    return <Text variant="muted">The {season} calendar isn’t available right now.</Text>;
  }

  const archive = buildArchive(data, new Date());
  const finished = archive.filter((entry) => entry.status === 'done').length;

  return (
    <section aria-labelledby="calendar-heading">
      <div className="flex items-end justify-between gap-4">
        <h2 id="calendar-heading" className="font-display text-3xl uppercase text-heading">
          Calendar
        </h2>
        <Eyebrow>
          {finished} / {archive.length} rounds run
        </Eyebrow>
      </div>
      <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {archive.map((entry) => (
          <li key={entry.event.roundNumber}>
            <RoundCard season={season} entry={entry} />
          </li>
        ))}
      </ol>
    </section>
  );
}
