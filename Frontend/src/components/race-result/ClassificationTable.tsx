import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { sortByPosition } from '@/lib/f1/classification';
import type { DriverResult } from '@/lib/validation/f1-schemas';

import { ClassificationRow } from './ClassificationRow';

/** Full finishing order with grid movement, time/gap and points. */
export function ClassificationTable({ results }: { results: ReadonlyArray<DriverResult> }): JSX.Element {
  const ordered = sortByPosition(results);
  const winner = ordered.find((result) => result.position === 1);

  return (
    <section aria-labelledby="classification-heading">
      <Eyebrow>
        <span id="classification-heading">Classification</span>
      </Eyebrow>
      <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-surface/60">
        <table className="w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-white/[0.08] font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="w-14 py-3 pl-4 font-medium">Pos</th>
              <th scope="col" className="py-3 font-medium">Driver</th>
              <th scope="col" className="hidden py-3 font-medium sm:table-cell">Team</th>
              <th scope="col" className="hidden w-24 py-3 font-medium md:table-cell">Grid</th>
              <th scope="col" className="w-28 py-3 font-medium sm:w-36">Time / Gap</th>
              <th scope="col" className="w-14 py-3 pr-4 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((result) => (
              <ClassificationRow key={result.abbreviation} result={result} winner={winner} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
