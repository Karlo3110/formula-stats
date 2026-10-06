import type { JSX } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { DriverAvatar } from '@/components/f1/DriverAvatar';
import type { DriverDirectory } from '@/hooks/use-season-drivers';
import { nationalityIso2 } from '@/lib/f1/countries';
import { resolveTeamColor, teamColor } from '@/lib/f1/team-colors';
import { cn } from '@/lib/utils/cn';
import type {
  ConstructorStandingRow,
  DriverProfile,
  DriverStandingRow,
  SeasonStandings,
} from '@/lib/validation/f1-schemas';

interface DriverRowProps {
  row: DriverStandingRow;
  leader: number;
  profile: DriverProfile | undefined;
}

function DriverRow({ row, leader, profile }: DriverRowProps): JSX.Element {
  const isLeader = row.position === 1;
  const color = resolveTeamColor(profile?.teamColor, row.team);
  const fullName = `${row.givenName} ${row.familyName}`;

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
      <span className="flex items-center gap-3">
        <DriverAvatar name={fullName} headshotUrl={profile?.headshotUrl} teamColor={color} />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-semibold text-foreground sm:text-lg">{fullName}</span>
            <CountryFlag iso2={nationalityIso2(profile?.countryCode)} label={profile?.countryCode ?? ''} />
          </span>
          <span className="block truncate text-xs uppercase tracking-wider text-muted">
            {row.team}
          </span>
        </span>
      </span>
      <span className="hidden text-sm tabular-nums text-muted sm:block">
        {row.wins} {row.wins === 1 ? 'win' : 'wins'}
      </span>
      <span className="hidden text-right text-xs uppercase tracking-wider text-muted sm:block">
        {leader > 0 && !isLeader ? `-${Math.round(leader - row.points)}` : ''}
      </span>
      <span className="text-right font-display text-2xl tabular-nums text-foreground">
        {row.points}
      </span>
    </li>
  );
}

function ConstructorRow({ row }: { row: ConstructorStandingRow }): JSX.Element {
  const color = teamColor(row.name);

  return (
    <li className="flex items-center gap-3 border-b border-white/10 py-3.5">
      <span
        className={cn(
          'w-8 font-display text-xl tabular-nums',
          row.position === 1 ? 'text-primary' : 'text-muted',
        )}
      >
        {row.position}
      </span>
      <span
        aria-hidden
        className="h-6 w-1 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <span className="min-w-0 flex-1 truncate text-base font-medium text-foreground">
        {row.name}
      </span>
      <span className="font-display text-xl tabular-nums text-foreground">
        {row.points}
      </span>
    </li>
  );
}

interface StandingsTablesProps {
  data: SeasonStandings;
  /** Headshots and nationalities; rows fall back to initials without them. */
  drivers: DriverDirectory;
}

export function StandingsTables({ data, drivers }: StandingsTablesProps): JSX.Element {
  const leaderPoints = data.drivers[0]?.points ?? 0;

  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-primary">
          Drivers
        </p>
        <ul className="mt-5 border-t border-white/10">
          {data.drivers.map((row) => (
            <DriverRow key={row.position} row={row} leader={leaderPoints} profile={drivers.get(row.code)} />
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
  );
}
