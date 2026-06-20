'use client';

import { useMemo, type JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useSchedule } from '@/hooks/use-f1';
import { findFeaturedEvent, findNextSession } from '@/lib/race-weekend';

import { CountdownHero } from './CountdownHero';
import { LiveRaceCard } from './LiveRaceCard';
import { SessionScheduleCard } from './SessionScheduleCard';

const SEASON = 2026;

export function HomeView(): JSX.Element {
  const { data, isLoading, isError } = useSchedule(SEASON);

  const featured = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const event = findFeaturedEvent(data, now);
    const next = findNextSession(data, now);
    return event ? { event, next } : null;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-2 sm:px-6">
      {featured ? (
        <CountdownHero event={featured.event} next={featured.next} />
      ) : (
        <div className="py-20">
          <Text variant="muted">
            {isError
              ? 'Could not load the schedule right now.'
              : 'No schedule available for this season yet.'}
          </Text>
        </div>
      )}

      {featured ? (
        <section className="mt-16 grid gap-x-16 gap-y-10 lg:grid-cols-[1.5fr_1fr]">
          <SessionScheduleCard event={featured.event} />
          <LiveRaceCard />
        </section>
      ) : null}
    </div>
  );
}
