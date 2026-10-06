import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { splitDriverName } from '@/lib/f1/classification';
import { historySeasonHref } from '@/lib/f1/routes';
import { teamColor } from '@/lib/f1/team-colors';
import { formatFullDate } from '@/lib/utils/date';
import type { DriverResult, WeekendEvent } from '@/lib/validation/f1-schemas';

interface RaceResultHeroProps {
  season: number;
  event: WeekendEvent;
  raceStart: Date | null;
  winner: DriverResult | null;
  /** Session switch and replay link. */
  actions: ReactNode;
  /** Circuit outline and headline figures. */
  aside: ReactNode;
}

function WinnerName({ winner }: { winner: DriverResult }): JSX.Element {
  const { given, family } = splitDriverName(winner.fullName);
  return (
    <div className="mt-10">
      <Eyebrow className="flex items-center gap-2">
        <span aria-hidden className="h-3 w-1 rounded-sm" style={{ backgroundColor: teamColor(winner.teamName) }} />
        Winner · {winner.teamName}
      </Eyebrow>
      <p className="mt-3 text-6xl font-bold leading-[0.88] tracking-[-0.045em] text-heading sm:text-8xl">
        {given ? <span className="block">{given}</span> : null}
        <span className="block">{family}</span>
      </p>
    </div>
  );
}

/** Editorial header: where and when, who won, and the circuit. */
export function RaceResultHero({ season, event, raceStart, winner, actions, aside }: RaceResultHeroProps): JSX.Element {
  return (
    <header className="grid gap-10 pb-12 pt-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
      <div className="min-w-0">
        <Link href={historySeasonHref(season)} className="font-mono text-xs text-muted transition hover:text-foreground">
          ← Season {season}
        </Link>
        <Eyebrow className="mt-8">
          Round {event.roundNumber} · {raceStart ? formatFullDate(raceStart) : season}
        </Eyebrow>
        <h1 className="mt-3 text-3xl font-light leading-tight text-foreground sm:text-5xl">
          {event.location}
          <span className="block text-foreground/50">{event.eventName}</span>
        </h1>
        {winner ? <WinnerName winner={winner} /> : null}
        <div className="mt-10 flex flex-wrap items-center gap-3">{actions}</div>
      </div>
      <div className="flex items-center justify-center gap-6">{aside}</div>
    </header>
  );
}
