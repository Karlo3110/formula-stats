'use client';

import type { JSX } from 'react';

import { ButtonLink } from '@/components/ui/ButtonLink';
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
      <span className="font-display text-4xl leading-none tabular-nums text-heading sm:text-8xl">
        {pad(value)}
      </span>
      <span className="mt-2 text-[0.55rem] uppercase tracking-[0.2em] text-muted sm:text-[0.6rem] sm:tracking-[0.4em]">
        {label}
      </span>
    </div>
  );
}

export function CountdownHero({ event, next }: CountdownHeroProps): JSX.Element {
  const cd = useCountdown(next?.start ?? null);
  const watermark = event.eventName.split(' ')[0] ?? event.country;

  return (
    <section className="relative overflow-hidden pb-12 pt-6">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[130%] -translate-x-1/2 -translate-y-1/2 select-none text-center font-display text-[20vw] uppercase leading-none text-foreground/[0.04]"
        style={{
          maskImage:
            'linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)',
        }}
      >
        {watermark}
      </span>

      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
        Next Grand Prix — Round {event.roundNumber}
      </p>

      <h1 className="mt-4 max-w-4xl font-display text-[2.75rem] uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
        {event.eventName}
      </h1>

      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-muted sm:text-sm sm:tracking-[0.3em]">
        {event.location}, {event.country}
      </p>

      {next ? (
        <div className="mt-10 sm:mt-14">
          <p className="mb-5 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/55 sm:text-xs sm:tracking-[0.4em]">
            {next.sessionName} begins in
          </p>
          <div className="flex items-end gap-5 sm:gap-14">
            <Unit value={cd.days} label="Days" />
            <Unit value={cd.hours} label="Hours" />
            <Unit value={cd.minutes} label="Mins" />
            <Unit value={cd.seconds} label="Secs" />
          </div>
        </div>
      ) : (
        <p className="mt-10 text-sm uppercase tracking-[0.3em] text-muted sm:mt-14">
          Season complete — relive it in the race archive
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:flex-wrap">
        <ButtonLink href="/race" size="lg" className="w-full sm:w-auto">
          Open race center
        </ButtonLink>
        <ButtonLink href="/history" size="lg" variant="secondary" className="w-full sm:w-auto">
          Browse past races
        </ButtonLink>
      </div>
    </section>
  );
}
