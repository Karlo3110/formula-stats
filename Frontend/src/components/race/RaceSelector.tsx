'use client';

import { useMemo, useState, type ChangeEvent, type JSX } from 'react';
import { useRouter } from 'next/navigation';

import { Select } from '@/components/ui/Select';
import { usePrefetchSchedule, useSchedule } from '@/hooks/use-f1';
import { replayableRounds } from '@/lib/f1/race-archive';
import { raceReplayHref } from '@/lib/f1/routes';
import { getArchiveSeasons } from '@/lib/f1/seasons';

interface RaceSelectorProps {
  season: number | null;
  round: number | null;
}

const NO_ROUND = '';

function roundPlaceholder(isLoading: boolean, hasRounds: boolean): string {
  if (isLoading) return 'Loading calendar…';
  return hasRounds ? 'Choose a Grand Prix' : 'Nothing run yet';
}

/**
 * Season and Grand Prix pickers. Changing the season lists that year's rounds;
 * choosing a round opens its replay. Remount with a `key` per season to reset.
 */
export function RaceSelector({ season, round }: RaceSelectorProps): JSX.Element {
  const router = useRouter();
  const seasons = useMemo(() => getArchiveSeasons(), []);
  const [browsingSeason, setBrowsingSeason] = useState<number>(season ?? seasons[0] ?? 0);
  const prefetchSchedule = usePrefetchSchedule();
  const schedule = useSchedule(browsingSeason);
  const rounds = useMemo(() => (schedule.data ? replayableRounds(schedule.data, new Date()) : []), [schedule.data]);
  const selectedRound = browsingSeason === season && round !== null ? String(round) : NO_ROUND;

  function handleSeasonChange(event: ChangeEvent<HTMLSelectElement>): void {
    const next = Number(event.target.value);
    setBrowsingSeason(next);
    prefetchSchedule(next);
  }

  function handleRoundChange(event: ChangeEvent<HTMLSelectElement>): void {
    const next = Number(event.target.value);
    if (Number.isInteger(next) && next > 0) {
      router.push(raceReplayHref({ season: browsingSeason, round: next }));
    }
  }

  return (
    <div className="flex min-w-0 items-end gap-2">
      <Select label="Season" value={browsingSeason} onChange={handleSeasonChange} className="w-24 shrink-0">
        {seasons.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      <Select
        label="Grand Prix"
        value={selectedRound}
        onChange={handleRoundChange}
        disabled={rounds.length === 0}
        className="w-60 min-w-0 sm:w-72"
      >
        {selectedRound === NO_ROUND ? (
          <option value={NO_ROUND} disabled>
            {roundPlaceholder(schedule.isLoading, rounds.length > 0)}
          </option>
        ) : null}
        {rounds.map((event) => (
          <option key={event.roundNumber} value={event.roundNumber}>
            {`R${event.roundNumber} · ${event.eventName}`}
          </option>
        ))}
      </Select>
    </div>
  );
}
