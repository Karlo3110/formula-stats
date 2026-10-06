import Link from 'next/link';
import type { JSX } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { eventCountryIso2 } from '@/lib/f1/countries';
import { cn } from '@/lib/utils/cn';
import type { ArchiveEntry } from '@/lib/f1/race-archive';
import { raceResultHref } from '@/lib/f1/routes';
import { formatDayMonth } from '@/lib/utils/date';

interface RoundCardProps {
  season: number;
  entry: ArchiveEntry;
}

const STATUS_LABELS: Record<ArchiveEntry['status'], string> = {
  done: 'Results',
  live: 'Live now',
  upcoming: 'Upcoming',
};

function CardBody({ entry }: { entry: ArchiveEntry }): JSX.Element {
  const { event, raceStart, status } = entry;
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-4xl leading-none tabular-nums text-foreground/25 transition-colors group-hover:text-primary">
          {event.roundNumber.toString().padStart(2, '0')}
        </span>
        <span className="font-mono text-xs text-muted">{raceStart ? formatDayMonth(raceStart) : 'TBC'}</span>
      </div>
      <div className="mt-6 min-w-0">
        <p className="flex items-center gap-2 truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
          <CountryFlag iso2={eventCountryIso2(event.country)} label={event.country} />
          {event.country}
        </p>
        <p className="mt-1 truncate text-base font-semibold text-heading">{event.eventName}</p>
      </div>
      <p
        className={cn(
          'mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em]',
          status === 'done' && 'text-foreground/70 group-hover:text-heading',
          status === 'live' && 'text-primary',
          status === 'upcoming' && 'text-muted/60',
        )}
      >
        {STATUS_LABELS[status]}
        {status === 'done' ? ' →' : ''}
      </p>
    </>
  );
}

const CARD_BASE = 'group block h-full rounded-xl border p-4 transition';

/** One round in the season calendar; finished rounds link to their result. */
export function RoundCard({ season, entry }: RoundCardProps): JSX.Element {
  if (entry.status !== 'done') {
    return (
      <div className={cn(CARD_BASE, 'border-white/[0.05] bg-transparent', entry.status === 'live' && 'border-primary/40')}>
        <CardBody entry={entry} />
      </div>
    );
  }
  return (
    <Link
      href={raceResultHref(season, entry.event.roundNumber)}
      className={cn(CARD_BASE, 'border-white/[0.08] bg-surface/70 hover:border-white/20 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      <CardBody entry={entry} />
    </Link>
  );
}
