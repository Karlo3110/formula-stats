import type { JSX } from 'react';

import { teamColor } from '@/lib/f1/team-colors';
import type { DriverStandingRow } from '@/lib/validation/f1-schemas';

function Stat({ value, label }: { value: string; label: string }): JSX.Element {
  return (
    <div className="flex flex-col">
      <span className="font-display text-2xl tabular-nums text-heading">
        {value}
      </span>
      <span className="text-[0.55rem] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
    </div>
  );
}

export function DriverStatCard({
  driver,
}: {
  driver: DriverStandingRow;
}): JSX.Element {
  const color = teamColor(driver.team);

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: color }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-3 select-none font-display text-7xl uppercase leading-none text-white/[0.04]"
      >
        {driver.code || driver.familyName.slice(0, 3)}
      </span>

      <div className="relative flex items-center justify-between">
        <span className="font-display text-3xl uppercase text-heading">
          {driver.code || driver.familyName.slice(0, 3).toUpperCase()}
        </span>
        <span
          className="font-display text-2xl tabular-nums"
          style={{ color }}
        >
          P{driver.position}
        </span>
      </div>

      <p className="relative mt-2 text-sm font-medium text-foreground">
        {driver.givenName} {driver.familyName}
      </p>
      <p className="relative text-[0.65rem] uppercase tracking-[0.2em] text-muted">
        {driver.team}
      </p>

      <div className="relative mt-5 flex gap-8 border-t border-white/10 pt-4">
        <Stat value={`${driver.points}`} label="Points" />
        <Stat value={`${driver.wins}`} label="Wins" />
      </div>
    </div>
  );
}
