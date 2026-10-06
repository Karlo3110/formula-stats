import type { JSX } from 'react';

const ROWS = 12;

/** Placeholder rows while the replay's timing data loads. */
export function TimingTowerSkeleton(): JSX.Element {
  return (
    <ol aria-hidden className="space-y-1 px-4 py-3">
      {Array.from({ length: ROWS }, (_, index) => (
        <li key={index} className="flex h-8 items-center gap-3">
          <span className="h-3 w-4 rounded-sm bg-white/[0.05]" />
          <span className="h-4 w-1 rounded-sm bg-white/[0.08]" />
          <span className="h-3 w-10 animate-pulse rounded-sm bg-white/[0.06]" />
          <span className="ml-auto h-3 w-8 rounded-sm bg-white/[0.04]" />
        </li>
      ))}
    </ol>
  );
}
