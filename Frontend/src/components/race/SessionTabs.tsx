import Link from 'next/link';
import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { sessionLabel, sessionName, type SessionCode, type WeekendSessionEntry } from '@/lib/f1/race-archive';

interface SessionTabsProps {
  sessions: ReadonlyArray<WeekendSessionEntry>;
  active: SessionCode;
  hrefFor: (session: SessionCode) => string;
}

const TAB_CLASS = 'whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition';

/** Every session of the weekend in running order; ones not yet run are shown but disabled. */
export function SessionTabs({ sessions, active, hrefFor }: SessionTabsProps): JSX.Element | null {
  if (sessions.length === 0) {
    return null;
  }
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">Session</span>
      <nav aria-label="Session" className="flex max-w-full overflow-x-auto rounded-md border border-white/10 bg-surface p-0.5">
        {sessions.map(({ code, status }) =>
          status === 'done' ? (
            <Link
              key={code}
              href={hrefFor(code)}
              title={sessionName(code)}
              aria-current={code === active ? 'page' : undefined}
              className={cn(TAB_CLASS, code === active ? 'bg-white/10 text-heading' : 'text-muted hover:text-foreground')}
            >
              {sessionLabel(code)}
            </Link>
          ) : (
            <span
              key={code}
              aria-disabled="true"
              title={`${sessionName(code)} has not been run yet`}
              className={cn(TAB_CLASS, 'cursor-not-allowed text-muted/40')}
            >
              {sessionLabel(code)}
            </span>
          ),
        )}
      </nav>
    </div>
  );
}
