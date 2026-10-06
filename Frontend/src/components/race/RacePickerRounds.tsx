'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { Spinner } from '@/components/ui/Spinner';
import { useSchedule } from '@/hooks/use-f1';
import { eventCountryIso2 } from '@/lib/f1/countries';
import { SessionCode, completedRounds, hasSession } from '@/lib/f1/race-archive';
import { raceReplayHref } from '@/lib/f1/routes';
import { formatDayMonth } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface RacePickerRoundsProps {
  season: number;
  activeSeason: number | null;
  activeRound: number | null;
  onNavigate: () => void;
}

/** Finished rounds of one season, newest first, each linking to its replay. */
export function RacePickerRounds({ season, activeSeason, activeRound, onNavigate }: RacePickerRoundsProps): JSX.Element {
  const { data, isLoading, isError } = useSchedule(season);

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  const rounds = data ? completedRounds(data, new Date()) : [];
  if (isError || rounds.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-muted">
        {isError ? 'Could not load this season’s calendar.' : 'No races have been run this season yet.'}
      </p>
    );
  }

  return (
    <ul className="mt-2 max-h-80 overflow-y-auto">
      {rounds.map((entry) => {
        const { event } = entry;
        const isActive = season === activeSeason && event.roundNumber === activeRound;
        return (
          <li key={event.roundNumber}>
            <Link
              href={raceReplayHref({ season, round: event.roundNumber })}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-md px-2 py-2 transition',
                isActive ? 'bg-primary/15' : 'hover:bg-white/[0.05]',
              )}
            >
              <span className="font-mono text-xs tabular-nums text-muted">R{event.roundNumber}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  <CountryFlag iso2={eventCountryIso2(event.country)} label={event.country} />
                  {event.eventName}
                </span>
                <span className="block truncate text-xs text-muted">
                  {event.location}
                  {hasSession(event, SessionCode.Sprint) ? ' · Sprint weekend' : ''}
                </span>
              </span>
              <span className="font-mono text-xs text-muted">
                {entry.raceStart ? formatDayMonth(entry.raceStart) : ''}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
