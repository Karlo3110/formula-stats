'use client';

import type { JSX } from 'react';

import { useCountdown } from '@/hooks/use-countdown';
import { useCurrentWeekend } from '@/hooks/use-f1';
import { findLiveSession } from '@/lib/race-weekend';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Compact status of the real-world weekend: a LIVE marker while a session is
 * running, otherwise a countdown to the next session.
 */
export function NextSessionChip(): JSX.Element | null {
  const { event, next, isLoading } = useCurrentWeekend();
  const countdown = useCountdown(next?.start ?? null);

  if (isLoading || !event) {
    return null;
  }

  const live = findLiveSession(event, new Date());
  if (live) {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 font-mono text-xs uppercase tracking-[0.12em] text-heading">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        Live now · {live.name}
      </span>
    );
  }
  if (!next) {
    return null;
  }

  const days = countdown.days > 0 ? `${countdown.days}d ` : '';
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 font-mono text-xs text-muted">
      <span className="uppercase tracking-[0.12em]">Next · {next.sessionName}</span>
      <span className="tabular-nums text-heading">
        {days}
        {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
      </span>
    </span>
  );
}
