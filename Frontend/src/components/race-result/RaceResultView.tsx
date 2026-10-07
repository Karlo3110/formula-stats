'use client';

import type { JSX } from 'react';

import { SessionSwitch } from '@/components/f1/SessionSwitch';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Spinner } from '@/components/ui/Spinner';
import { useSchedule } from '@/hooks/use-f1';
import { buildArchive, defaultSession, finishedSessions, isResultSession, type SessionCode } from '@/lib/f1/race-archive';
import { historySeasonHref, raceReplayHref, raceResultHref } from '@/lib/f1/routes';

import { CircuitPanel } from './CircuitPanel';
import { RaceResultBody } from './RaceResultBody';
import { ResultNotice } from './ResultNotice';

interface RaceResultViewProps {
  season: number;
  round: number;
  session: SessionCode;
}

function pickSession(requested: SessionCode, available: SessionCode[]): SessionCode | null {
  if (available.length === 0) return null;
  return available.includes(requested) ? requested : defaultSession(available);
}

/** One Grand Prix from the archive: winner, circuit, podium, classification. */
export function RaceResultView({ season, round, session }: RaceResultViewProps): JSX.Element {
  const scheduleQuery = useSchedule(season);

  if (scheduleQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  const entry = scheduleQuery.data
    ? buildArchive(scheduleQuery.data, new Date()).find((e) => e.event.roundNumber === round)
    : undefined;
  if (!entry) {
    return (
      <ResultNotice
        title={scheduleQuery.isError ? 'Calendar unavailable' : 'Race not found'}
        body={
          scheduleQuery.isError
            ? `The ${season} calendar could not be loaded. Try again in a moment.`
            : `Round ${round} is not on the ${season} calendar.`
        }
        backHref={historySeasonHref(season)}
      />
    );
  }

  const sessions = finishedSessions(entry.event, new Date()).filter(isResultSession);
  const activeSession = pickSession(session, sessions);
  const actions = activeSession ? (
    <>
      <ButtonLink href={raceReplayHref({ season, round, session: activeSession })} size="lg">
        Watch the replay in 3D
      </ButtonLink>
      <SessionSwitch sessions={sessions} active={activeSession} hrefFor={(code) => raceResultHref(season, round, code)} />
    </>
  ) : null;

  return (
    <div className="mx-auto max-w-[90rem] px-2 sm:px-6">
      <RaceResultBody
        season={season}
        entry={entry}
        session={activeSession}
        actions={actions}
        circuit={
          activeSession ? (
            <CircuitPanel season={season} round={round} session={activeSession} isEnabled />
          ) : null
        }
      />
    </div>
  );
}
