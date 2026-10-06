import Link from 'next/link';
import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { sessionName, type SessionCode } from '@/lib/f1/race-archive';

interface SessionSwitchProps {
  sessions: ReadonlyArray<SessionCode>;
  active: SessionCode;
  hrefFor: (session: SessionCode) => string;
}

/** Race / Sprint toggle, shown only on weekends with more than one session to show. */
export function SessionSwitch({ sessions, active, hrefFor }: SessionSwitchProps): JSX.Element | null {
  if (sessions.length < 2) {
    return null;
  }
  return (
    <nav aria-label="Session" className="flex rounded-md border border-white/10 bg-surface p-0.5">
      {sessions.map((code) => (
        <Link
          key={code}
          href={hrefFor(code)}
          aria-current={code === active ? 'page' : undefined}
          className={cn(
            'rounded px-3 py-1.5 text-sm font-medium transition',
            code === active ? 'bg-white/10 text-heading' : 'text-muted hover:text-foreground',
          )}
        >
          {sessionName(code)}
        </Link>
      ))}
    </nav>
  );
}
