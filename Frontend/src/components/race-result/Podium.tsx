import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { teamColor } from '@/lib/f1/team-colors';
import { cn } from '@/lib/utils/cn';
import type { DriverResult } from '@/lib/validation/f1-schemas';

function PodiumStep({ result }: { result: DriverResult }): JSX.Element {
  const isWinner = result.position === 1;
  return (
    <li className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface/70 p-4 sm:p-5">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: teamColor(result.teamName) }} />
      <div className="flex items-baseline justify-between">
        <span className={cn('font-display text-5xl leading-none', isWinner ? 'text-accent' : 'text-foreground/40')}>
          P{result.position}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted">+{result.points} pts</span>
      </div>
      <p className="mt-3 font-display text-3xl uppercase leading-none text-heading sm:mt-6">{result.abbreviation}</p>
      <p className="mt-1 truncate text-sm text-foreground/80">{result.fullName}</p>
      <p className="truncate text-xs text-muted">{result.teamName}</p>
    </li>
  );
}

/** Top three finishers. */
export function Podium({ podium }: { podium: ReadonlyArray<DriverResult> }): JSX.Element {
  return (
    <section aria-labelledby="podium-heading">
      <Eyebrow>
        <span id="podium-heading">Podium</span>
      </Eyebrow>
      <ol className="mt-3 grid gap-3 sm:grid-cols-3">
        {podium.map((result) => (
          <PodiumStep key={result.abbreviation} result={result} />
        ))}
      </ol>
    </section>
  );
}
