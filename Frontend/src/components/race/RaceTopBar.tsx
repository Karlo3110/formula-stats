'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { useFullscreen } from '@/hooks/use-fullscreen';

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      {active ? (
        <path d="M9 9H5m0 0V5m0 4l5-5m5 5h4m0 0V5m0 4l-5-5M9 15H5m0 0v4m0-4l5 5m5-5h4m0 0v4m0-4l-5 5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4m11-5v4a1 1 0 01-1 1h-4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function RaceTopBar(): JSX.Element {
  const { isFullscreen, toggle } = useFullscreen();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-5 py-4">
      <div className="pointer-events-auto flex items-center gap-4">
        <Link
          href="/"
          aria-label="Exit live race"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-foreground backdrop-blur-md transition hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeftIcon />
        </Link>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg uppercase tracking-[0.2em] text-heading">
            Formula <span className="text-primary">Stats</span>
          </span>
          <span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Live Race
          </span>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-warning">
          Demo replay
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle fullscreen"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-foreground backdrop-blur-md transition hover:border-primary/50 hover:text-primary"
        >
          <ExpandIcon active={isFullscreen} />
        </button>
      </div>
    </div>
  );
}
