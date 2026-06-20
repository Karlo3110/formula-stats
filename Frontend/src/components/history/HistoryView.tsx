'use client';

import { useMemo, useState, type JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import { getCurrentSeason, getSelectableSeasons } from '@/lib/f1/seasons';
import { useSeasonStandings } from '@/hooks/use-f1';
import type {
  ConstructorStandingRow,
  DriverStandingRow,
} from '@/lib/validation/f1-schemas';

function DriverRow({
  row,
  leader,
}: {
  row: DriverStandingRow;
  leader: number;
}): JSX.Element {
  const isLeader = row.position === 1;
  return (
    <li className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-white/10 py-4 sm:grid-cols-[3rem_1fr_8rem_5rem_5rem]">
      <span
        className={cn(
          'font-display text-2xl tabular-nums',
          isLeader ? 'text-primary' : 'text-muted',
        )}
      >
        {row.position}
      </span>
      <span>
        <span className="text-base font-semibold text-foreground sm:text-lg">
          {row.givenName} {row.familyName}
        </span>
        <span className="block text-xs uppercase tracking-wider text-muted">
          {row.team}
        </span>
      </span>
      <span className="hidden text-sm tabular-nums text-muted sm:block">
        {row.wins} {row.wins === 1 ? 'win' : 'wins'}
      </span>
      <span className="hidden text-right text-xs uppercase tracking-wider text-muted sm:block">
        {leader > 0 ? `-${Math.round(leader - row.points)}` : ''}
      </span>
      <span className="text-right font-display text-2xl tabular-nums text-foreground">
        {row.points}
      </span>
    </li>
  );
}

function ConstructorRow({ row }: { row: ConstructorStandingRow }): JSX.Element {
  return (
    <li className="flex items-center gap-4 border-b border-white/10 py-3.5">
      <span
        className={cn(
          'w-8 font-display text-xl tabular-nums',
          row.position === 1 ? 'text-primary' : 'text-muted',
        )}
      >
        {row.position}
      </span>
      <span className="flex-1 text-base font-medium text-foreground">
        {row.name}
      </span>
      <span className="font-display text-xl tabular-nums text-foreground">
        {row.points}
      </span>
    </li>
  );
}

export function HistoryView(): JSX.Element {
  const seasons = useMemo(() => getSelectableSeasons(), []);
  const [season, setSeason] = useState<number>(() => getCurrentSeason());
  const { data, isLoading, isError } = useSeasonStandings(season);
  const leaderPoints = data?.drivers[0]?.points ?? 0;

  return (
    <div className="mx-auto max-w-[80rem] px-2 sm:px-6">
      <header className="pb-6 pt-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
          Season Statistics
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.9] tracking-tight text-heading sm:text-8xl">
          Championship
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/65">
          Final drivers’ and constructors’ standings, season by season.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        {seasons.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSeason(year)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              season === year
                ? 'bg-primary text-primary-foreground'
                : 'glass-pill text-muted hover:text-foreground',
            )}
          >
            {year}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError || !data || data.drivers.length === 0 ? (
        <Text variant="muted" className="mt-10">
          Standings for {season} aren’t available right now.
        </Text>
      ) : (
        <div className="mt-12 grid gap-x-16 gap-y-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-primary">
              Drivers
            </p>
            <ul className="mt-5 border-t border-white/10">
              {data.drivers.map((row) => (
                <DriverRow key={row.position} row={row} leader={leaderPoints} />
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-primary">
              Constructors
            </p>
            <ul className="mt-5 border-t border-white/10">
              {data.constructors.map((row) => (
                <ConstructorRow key={row.position} row={row} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
