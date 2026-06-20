import Link from 'next/link';
import type { JSX } from 'react';

export function LiveRaceCard(): JSX.Element {
  return (
    <Link
      href="/race"
      className="glass-panel group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 transition hover:border-primary/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 transition group-hover:opacity-70"
        style={{
          background:
            'linear-gradient(120deg, transparent 30%, var(--color-primary) 70%, var(--color-accent) 120%)',
        }}
      />
      <div className="relative">
        <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Live Race
        </span>
        <h2 className="mt-3 font-display text-4xl uppercase leading-none text-heading">
          Watch the
          <br />
          3D Replay
        </h2>
      </div>
      <p className="relative mt-6 text-sm text-foreground/80">
        Cars driven by real telemetry on the real circuit — cinematic corner
        cameras, free-orbit, live order. →
      </p>
    </Link>
  );
}
