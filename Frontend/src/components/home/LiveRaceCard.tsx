import Link from 'next/link';
import type { JSX } from 'react';

export function LiveRaceCard(): JSX.Element {
  return (
    <Link
      href="/race"
      className="group relative flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-8"
    >
      <div
        aria-hidden
        className="absolute inset-0 transition duration-500 group-hover:scale-105"
        style={{
          background:
            'radial-gradient(120% 120% at 80% 10%, var(--color-primary) 0%, transparent 55%), radial-gradient(120% 120% at 10% 110%, var(--color-accent) 0%, transparent 50%), #0a0d12',
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative">
        <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.35em] text-white/90">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live Race
        </span>
        <h2 className="mt-4 font-display text-5xl uppercase leading-[0.9] text-white">
          Watch the
          <br />
          3D replay
        </h2>
        <p className="mt-4 max-w-sm text-sm text-white/80">
          Real telemetry on the real circuit — cinematic corner cameras, free
          orbit, live order. →
        </p>
      </div>
    </Link>
  );
}
