'use client';

import { useMemo, type JSX } from 'react';

import { CircuitOutline } from '@/components/f1/CircuitOutline';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Eyebrow } from '@/components/ui/Typography';
import { useLatestRace, useSchedule, useSessionResults, useTrackMap } from '@/hooks/use-f1';
import { podiumOf } from '@/lib/f1/classification';
import { SessionCode, findEvent } from '@/lib/f1/race-archive';
import { raceReplayHref, raceResultHref } from '@/lib/f1/routes';
import { projectTrack } from '@/lib/race/track-projection';

const VIEW_SIZE = 220;
const VIEW_PADDING = 14;

/** The most recent finished Grand Prix: circuit, winner, replay and results links. */
export function LatestRaceCard(): JSX.Element | null {
  const { race } = useLatestRace();
  const season = race?.season ?? 0;
  const round = race?.round ?? 0;
  const isKnown = race !== null;
  const { data: schedule } = useSchedule(season, { enabled: isKnown });
  const { data: results } = useSessionResults(season, round, SessionCode.Race, { enabled: isKnown });
  const { data: trackMap } = useTrackMap(season, round, SessionCode.Race, { enabled: isKnown });
  const projection = useMemo(
    () => (trackMap ? projectTrack(trackMap.track, VIEW_SIZE, VIEW_PADDING) : null),
    [trackMap],
  );

  const event = findEvent(schedule, round);
  if (!race || !event) {
    return null;
  }
  const winner = results ? podiumOf(results.results)[0] : undefined;

  return (
    <section className="flex flex-col rounded-2xl border border-white/[0.08] bg-surface/70 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Latest race · Round {event.roundNumber}</Eyebrow>
          <h2 className="mt-2 truncate font-display text-4xl uppercase leading-none text-heading">{event.eventName}</h2>
          <p className="mt-1 text-sm text-muted">{event.location}</p>
        </div>
        {winner ? (
          <div className="shrink-0 text-right">
            <Eyebrow>Winner</Eyebrow>
            <p className="mt-1 font-display text-3xl leading-none text-accent">{winner.abbreviation}</p>
          </div>
        ) : null}
      </div>

      <div className="my-4 flex flex-1 items-center justify-center">
        {projection ? (
          <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} className="aspect-square w-full max-w-[15rem]" role="img" aria-label={`${event.location} circuit layout`}>
            <CircuitOutline projection={projection} />
          </svg>
        ) : (
          <div aria-hidden className="aspect-square w-full max-w-[15rem]" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href={raceReplayHref({ season, round })} size="md" className="text-sm">
          Replay the start
        </ButtonLink>
        <ButtonLink href={raceResultHref(season, round)} size="md" variant="secondary" className="text-sm">
          Full results
        </ButtonLink>
      </div>
    </section>
  );
}
