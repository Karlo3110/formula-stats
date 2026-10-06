import type { JSX } from 'react';

import { Eyebrow } from '@/components/ui/Typography';
import { isClassifiedFinish, sortByPosition } from '@/lib/f1/classification';
import { teamColor } from '@/lib/f1/team-colors';
import { cn } from '@/lib/utils/cn';
import type { DriverResult } from '@/lib/validation/f1-schemas';

const NOT_CLASSIFIED = 'NC';

function ClassificationRow({ result }: { result: DriverResult }): JSX.Element {
  const isFinisher = isClassifiedFinish(result);
  return (
    <tr className="border-b border-white/[0.06] last:border-b-0">
      <td className="py-3 pl-4 pr-2 font-mono text-sm tabular-nums text-muted">{result.position ?? NOT_CLASSIFIED}</td>
      <td className="py-3 pr-3">
        <span className="flex items-center gap-3">
          <span aria-hidden className="h-6 w-1 shrink-0 rounded-sm" style={{ backgroundColor: teamColor(result.teamName) }} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-heading">{result.fullName}</span>
            <span className="block truncate text-xs text-muted sm:hidden">{result.teamName}</span>
          </span>
        </span>
      </td>
      <td className="hidden py-3 pr-3 text-sm text-muted sm:table-cell">{result.teamName}</td>
      <td className={cn('py-3 pr-3 font-mono text-xs', isFinisher ? 'text-muted' : 'text-warning')}>{result.status}</td>
      <td className="py-3 pr-4 text-right font-mono text-sm tabular-nums text-heading">
        {result.points > 0 ? result.points : '–'}
      </td>
    </tr>
  );
}

/** Full finishing order with status and points. */
export function ClassificationTable({ results }: { results: ReadonlyArray<DriverResult> }): JSX.Element {
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
              <th scope="col" className="w-24 py-3 font-medium sm:w-32">Status</th>
              <th scope="col" className="w-16 py-3 pr-4 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortByPosition(results).map((result) => (
              <ClassificationRow key={result.abbreviation} result={result} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
