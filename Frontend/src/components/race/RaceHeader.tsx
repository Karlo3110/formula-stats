import Link from 'next/link';
import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { CountryFlag } from '@/components/f1/CountryFlag';
import { SessionSwitch } from '@/components/f1/SessionSwitch';
import { eventCountryIso2 } from '@/lib/f1/countries';
import type { SessionCode } from '@/lib/f1/race-archive';
import { raceReplayHref, raceResultHref } from '@/lib/f1/routes';
import type { WeekendEvent } from '@/lib/validation/f1-schemas';

import { NextSessionChip } from './NextSessionChip';
import { RacePicker } from './RacePicker';

interface RaceHeaderProps {
  season: number | null;
  event: WeekendEvent | null;
  sessions: ReadonlyArray<SessionCode>;
  activeSession: SessionCode;
}

function eventMeta(season: number, event: WeekendEvent): string {
  return `${season} · Round ${event.roundNumber} · ${event.location}, ${event.country}`;
}

/** Which race is on screen, plus controls to switch session or race. */
export function RaceHeader({ season, event, sessions, activeSession }: RaceHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {season !== null && event ? (
          <>
            <Eyebrow className="flex items-center gap-2">
              <CountryFlag iso2={eventCountryIso2(event.country)} label={event.country} />
              {eventMeta(season, event)}
            </Eyebrow>
            <h1 className="mt-2 truncate font-display text-4xl uppercase leading-none text-heading sm:text-5xl">
              {event.eventName}
            </h1>
          </>
        ) : (
          <div aria-hidden className="space-y-3">
            <div className="h-3 w-56 animate-pulse rounded-sm bg-white/[0.06]" />
            <div className="h-10 w-80 max-w-full animate-pulse rounded-sm bg-white/[0.06]" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NextSessionChip />
        {season !== null && event ? (
          <>
            <SessionSwitch
              sessions={sessions}
              active={activeSession}
              hrefFor={(session) => raceReplayHref({ season, round: event.roundNumber, session })}
            />
            <Link
              href={raceResultHref(season, event.roundNumber, activeSession)}
              className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              Results
            </Link>
          </>
        ) : null}
        <RacePicker season={season} round={event?.roundNumber ?? null} />
      </div>
    </header>
  );
}
