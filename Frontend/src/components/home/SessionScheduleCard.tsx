'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import {
  formatSessionTime,
  sessionStatus,
  type SessionStatus,
} from '@/lib/race-weekend';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

const STATUS_STYLES: Record<SessionStatus, string> = {
  done: 'bg-muted/40',
  live: 'bg-accent animate-pulse',
  upcoming: 'bg-primary',
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: 'Done',
  live: 'Live',
  upcoming: 'Upcoming',
};

export function SessionScheduleCard({
  event,
}: {
  event: WeekendEvent;
}): JSX.Element {
  const now = new Date();

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        Weekend Schedule
      </h2>
      <ul className="mt-4 flex flex-col gap-2">
        {event.sessions.map((session) => {
          const start = session.startUtc ? new Date(session.startUtc) : null;
          const status: SessionStatus = start
            ? sessionStatus(start, now)
            : 'upcoming';
          return (
            <li
              key={session.name}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5',
                status === 'live' ? 'bg-accent/10' : 'bg-white/[0.03]',
              )}
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_STYLES[status])} />
              <span
                className={cn(
                  'text-sm font-medium',
                  status === 'done' ? 'text-muted' : 'text-foreground',
                )}
              >
                {session.name}
              </span>
              <span className="ml-auto text-xs tabular-nums text-muted">
                {start ? formatSessionTime(start) : '—'}
              </span>
              <span className="w-16 text-right text-[0.6rem] uppercase tracking-wider text-muted">
                {STATUS_LABEL[status]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
