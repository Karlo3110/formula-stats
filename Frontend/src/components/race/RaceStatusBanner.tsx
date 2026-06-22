'use client';

import type { JSX } from 'react';

import { useCountdown } from '@/hooks/use-countdown';
import { useCurrentWeekend } from '@/hooks/use-f1';
import { findLiveSession } from '@/lib/race-weekend';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function CountdownDigits({ target }: { target: Date }): JSX.Element {
  const cd = useCountdown(target);
  const parts: ReadonlyArray<{ value: number; label: string; show: boolean }> = [
    { value: cd.days, label: 'D', show: cd.days > 0 },
    { value: cd.hours, label: 'H', show: true },
    { value: cd.minutes, label: 'M', show: true },
    { value: cd.seconds, label: 'S', show: true },
  ];
  return (
    <div className="flex items-end gap-2">
      {parts
        .filter((part) => part.show)
        .map((part) => (
          <div key={part.label} className="flex items-baseline gap-0.5">
            <span className="font-display text-2xl leading-none tabular-nums text-heading sm:text-3xl">
              {pad(part.value)}
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
              {part.label}
            </span>
          </div>
        ))}
    </div>
  );
}

/**
 * Top-of-scene status for the live page: a pulsing LIVE badge when a session is
 * running, otherwise a countdown to the next session (qualifying, race, …).
 * Renders nothing off-season or while the schedule loads.
 */
export function RaceStatusBanner(): JSX.Element | null {
  const { event, next, isLoading } = useCurrentWeekend();

  // Drive a 1s re-render so the live-window check stays current even when there
  // is no upcoming session to count down to.
  useCountdown(next?.start ?? null);

  if (isLoading || !event) {
    return null;
  }

  const live = findLiveSession(event, new Date());

  if (live) {
    return (
      <div className="glass-pill flex items-center gap-2.5 rounded-full px-4 py-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-foreground">
          Live · {live.name}
        </span>
        <span className="hidden text-[0.7rem] uppercase tracking-[0.25em] text-muted sm:inline">
          {event.location}
        </span>
      </div>
    );
  }

  if (next) {
    return (
      <div className="glass-pill flex items-center gap-3 rounded-full py-2 pl-4 pr-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-primary">
            Next · {next.sessionName}
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
            {event.location}
          </span>
        </div>
        <span aria-hidden className="h-7 w-px bg-white/10" />
        <CountdownDigits target={next.start} />
      </div>
    );
  }

  return (
    <div className="glass-pill rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-muted">
      Season complete · relive the last race
    </div>
  );
}
