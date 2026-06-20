'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import {
  formatSessionTime,
  sessionStatus,
  type SessionStatus,
} from '@/lib/race-weekend';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

const DOT_STYLES: Record<SessionStatus, string> = {
  done: 'bg-muted/40',
  live: 'bg-accent shadow-[0_0_10px] shadow-accent animate-pulse',
  upcoming: 'bg-primary',
};

export function SessionScheduleCard({
  event,
}: {
  event: WeekendEvent;
}): JSX.Element {
  const now = new Date();

  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-primary">
        Weekend Schedule
      </p>
      <ul className="mt-5 border-t border-white/10">
        {event.sessions.map((session) => {
          const start = session.startUtc ? new Date(session.startUtc) : null;
          const status: SessionStatus = start
            ? sessionStatus(start, now)
            : 'upcoming';
          return (
            <li
              key={session.name}
              className="flex items-center gap-3 border-b border-white/10 py-4 sm:gap-4"
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full',
                  DOT_STYLES[status],
                )}
              />
              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-base font-medium sm:text-lg',
                  status === 'done' ? 'text-muted' : 'text-foreground',
                )}
              >
                {session.name}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-muted">
                {start ? formatSessionTime(start) : '—'}
              </span>
              <span
                className={cn(
                  'hidden w-20 shrink-0 text-right text-[0.6rem] uppercase tracking-[0.2em] sm:block',
                  status === 'live' ? 'text-accent' : 'text-muted',
                )}
              >
                {status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
