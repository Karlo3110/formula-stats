import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { DriverPortrait } from '@/components/f1/DriverPortrait';
import { Eyebrow } from '@/components/ui/Typography';
import { splitDriverName } from '@/lib/f1/classification';
import { eventCountryIso2, nationalityIso2 } from '@/lib/f1/countries';
import { historySeasonHref } from '@/lib/f1/routes';
import { resolveTeamColor } from '@/lib/f1/team-colors';
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
  const color = resolveTeamColor(winner.teamColor, winner.teamName);
  return (
    <div className="mt-10 flex items-end gap-4">
      <div className="min-w-0">
        <Eyebrow className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-1 rounded-sm" style={{ backgroundColor: color }} />
          Winner · {winner.teamName}
          <CountryFlag iso2={nationalityIso2(winner.countryCode)} label={winner.countryCode ?? ''} />
        </Eyebrow>
        <p className="mt-3 text-6xl font-bold leading-[0.88] tracking-[-0.045em] text-heading sm:text-8xl">
          {given ? <span className="block">{given}</span> : null}
          <span className="block">{family}</span>
        </p>
      </div>
      <div className="hidden w-48 shrink-0 sm:block xl:w-60">
        <DriverPortrait name={winner.fullName} headshotUrl={winner.headshotUrl} teamColor={color} />
      </div>
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
          <span className="flex items-center gap-3">
            {event.location}
            <CountryFlag iso2={eventCountryIso2(event.country)} label={event.country} size="lg" />
          </span>
          <span className="block text-foreground/50">{event.eventName}</span>
        </h1>
        {winner ? <WinnerName winner={winner} /> : null}
        <div className="mt-10 flex flex-wrap items-center gap-3">{actions}</div>
      </div>
      <div className="flex items-center justify-center gap-6">{aside}</div>
    </header>
  );
}
