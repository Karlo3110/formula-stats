'use client';

import type { JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useCurrentWeekend } from '@/hooks/use-f1';

import { ChampionshipTeaser } from './ChampionshipTeaser';
import { CountdownHero } from './CountdownHero';
import { LiveRaceCard } from './LiveRaceCard';
import { SessionScheduleCard } from './SessionScheduleCard';

export function HomeView(): JSX.Element {
  const { event, next, isLoading, isError } = useCurrentWeekend();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-2 sm:px-6">
      {event ? (
        <CountdownHero event={event} next={next} />
      ) : (
        <div className="py-20">
          <Text variant="muted">
            {isError
              ? 'Could not load the schedule right now.'
              : 'No schedule available for this season yet.'}
          </Text>
        </div>
      )}

      {event ? (
        <section className="mt-16 grid gap-x-16 gap-y-10 lg:grid-cols-[1.5fr_1fr]">
          <SessionScheduleCard event={event} />
          <LiveRaceCard />
        </section>
      ) : null}

      <ChampionshipTeaser />
    </div>
  );
}
