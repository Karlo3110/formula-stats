'use client';

import type { JSX } from 'react';

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
    <div className="flex flex-col items-center">
      <span className="font-display text-5xl tabular-nums text-heading sm:text-6xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-[0.6rem] uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
    </div>
  );
}

export function CountdownHero({ event, next }: CountdownHeroProps): JSX.Element {
  const cd = useCountdown(next?.start ?? null);

  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl p-8 md:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'conic-gradient(from 120deg, var(--color-primary), var(--color-accent), var(--color-primary))',
        }}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
        Round {event.roundNumber} · {event.country}
      </p>
      <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight text-heading sm:text-7xl">
        {event.eventName}
      </h1>
      <p className="mt-2 text-sm uppercase tracking-[0.25em] text-muted">
        {event.location}
      </p>

      <div className="relative mt-8">
        {next ? (
          <>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
              {next.sessionName} starts in
            </p>
            <div className="flex gap-6 sm:gap-10">
              <Unit value={cd.days} label="Days" />
              <Unit value={cd.hours} label="Hrs" />
              <Unit value={cd.minutes} label="Min" />
              <Unit value={cd.seconds} label="Sec" />
            </div>
          </>
        ) : (
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Season complete
          </p>
        )}
      </div>
    </section>
  );
}
