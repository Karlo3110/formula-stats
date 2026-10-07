import Link from 'next/link';
import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { CountryFlag } from '@/components/f1/CountryFlag';
import { eventCountryIso2 } from '@/lib/f1/countries';
import { isResultSession, type SessionCode, type WeekendSessionEntry } from '@/lib/f1/race-archive';
import { raceReplayHref, raceResultHref } from '@/lib/f1/routes';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

import { NextSessionChip } from './NextSessionChip';
import { RaceSelector } from './RaceSelector';
import { SessionTabs } from './SessionTabs';

interface RaceHeaderProps {
  season: number | null;
  event: WeekendEvent | null;
  weekend: ReadonlyArray<WeekendSessionEntry>;
  activeSession: SessionCode;
}

function eventMeta(season: number, event: WeekendEvent): string {
  return `${season} · Round ${event.roundNumber} · ${event.location}, ${event.country}`;
}

function EventTitle({ season, event }: { season: number | null; event: WeekendEvent | null }): JSX.Element {
  if (season === null || !event) {
    return (
      <div aria-hidden className="space-y-3">
        <div className="h-3 w-56 animate-pulse rounded-sm bg-white/[0.06]" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded-sm bg-white/[0.06]" />
      </div>
    );
  }
  return (
    <>
      <Eyebrow className="flex items-center gap-2">
        <CountryFlag iso2={eventCountryIso2(event.country)} label={event.country} />
        {eventMeta(season, event)}
      </Eyebrow>
      <h1 className="mt-2 truncate font-display text-4xl uppercase leading-none text-heading sm:text-5xl">
        {event.eventName}
      </h1>
    </>
  );
}

/** Which session is on screen, plus explicit pickers for season, Grand Prix and session. */
export function RaceHeader({ season, event, weekend, activeSession }: RaceHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <EventTitle season={season} event={event} />
        </div>
        <NextSessionChip />
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <RaceSelector key={season ?? 'latest'} season={season} round={event?.roundNumber ?? null} />
        {season !== null && event ? (
          <>
            <SessionTabs
              sessions={weekend}
              active={activeSession}
              hrefFor={(session) => raceReplayHref({ season, round: event.roundNumber, session })}
            />
            {isResultSession(activeSession) ? (
              <Link
                href={raceResultHref(season, event.roundNumber, activeSession)}
                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted transition hover:text-foreground"
              >
                Classification
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
    </header>
  );
}
