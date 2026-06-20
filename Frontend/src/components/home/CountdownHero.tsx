'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { useCountdown } from '@/hooks/use-countdown';
import type { UpcomingSession } from '@/lib/race-weekend';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

interface CountdownHeroProps {
  event: WeekendEvent;
  next: UpcomingSession | null;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function Unit({ value, label }: { value: number; label: string }): JSX.Element {
  return (
    <div className="flex flex-col">
      <span className="font-display text-5xl leading-none tabular-nums text-heading sm:text-7xl">
        {pad(value)}
      </span>
      <span className="mt-2 text-[0.6rem] uppercase tracking-[0.35em] text-muted">
        {label}
      </span>
    </div>
  );
}

export function CountdownHero({ event, next }: CountdownHeroProps): JSX.Element {
  const cd = useCountdown(next?.start ?? null);

  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl px-8 py-12 sm:px-14 sm:py-16">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-primary), var(--color-accent), transparent)',
        }}
      />

      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
        Next Grand Prix
      </p>

      <h1 className="mt-4 max-w-3xl font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
        {event.eventName}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm uppercase tracking-[0.2em] text-muted">
        <span>Round {event.roundNumber}</span>
        <span className="text-border">/</span>
        <span>
          {event.location}, {event.country}
        </span>
      </div>

      {next ? (
        <div className="mt-12">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-foreground/60">
            {next.sessionName} begins in
          </p>
          <div className="flex items-end gap-6 sm:gap-10">
            <Unit value={cd.days} label="Days" />
            <Unit value={cd.hours} label="Hours" />
            <Unit value={cd.minutes} label="Minutes" />
            <Unit value={cd.seconds} label="Seconds" />
          </div>
        </div>
      ) : (
        <p className="mt-12 text-sm uppercase tracking-[0.3em] text-muted">
          Season complete — relive it in History
        </p>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/race">
          <Button size="lg">Watch live race</Button>
        </Link>
        <Link href="/learn">
          <Button size="lg" variant="secondary">
            Learn the sport
          </Button>
        </Link>
      </div>
    </section>
  );
}
