'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useLatestStandings } from '@/hooks/use-f1';

const TOP_DRIVERS = 5;
const TOP_TEAMS = 3;

export function ChampionshipTeaser(): JSX.Element | null {
  const { data, season, isLoading, isError } = useLatestStandings();

  if (isError || (!isLoading && !data?.drivers.length)) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-primary">
            Championship · {season}
          </p>
          <h2 className="mt-2 font-display text-4xl uppercase leading-none text-heading sm:text-5xl">
            Standings
          </h2>
        </div>
        <Link
          href="/standings"
          className="text-xs uppercase tracking-[0.25em] text-primary transition hover:text-foreground"
        >
          Full table →
        </Link>
      </div>

      {isLoading || !data ? (
        <div className="flex min-h-[12rem] items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 grid gap-x-16 gap-y-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted">
              Drivers
            </p>
            <ul className="mt-4 border-t border-white/10">
              {data.drivers.slice(0, TOP_DRIVERS).map((d) => (
                <li
                  key={d.position}
                  className="flex items-center gap-4 border-b border-white/10 py-3"
                >
                  <span className="w-6 font-display text-xl tabular-nums text-muted">
                    {d.position}
                  </span>
                  <span className="font-semibold text-foreground">
                    {d.givenName} {d.familyName}
                  </span>
                  <span className="hidden text-xs uppercase tracking-wider text-muted sm:inline">
                    {d.team}
                  </span>
                  <span className="ml-auto font-display text-xl tabular-nums text-foreground">
                    {d.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted">
              Constructors
            </p>
            <ul className="mt-4 border-t border-white/10">
              {data.constructors.slice(0, TOP_TEAMS).map((c) => (
                <li
                  key={c.position}
                  className="flex items-center gap-4 border-b border-white/10 py-3"
                >
                  <span className="w-6 font-display text-xl tabular-nums text-muted">
                    {c.position}
                  </span>
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="ml-auto font-display text-xl tabular-nums text-foreground">
                    {c.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
