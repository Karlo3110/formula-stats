import type { JSX } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { DriverAvatar } from '@/components/f1/DriverAvatar';
import { gridLabel, isClassifiedFinish, positionsGained, timeOrGapLabel } from '@/lib/f1/classification';
import { nationalityIso2 } from '@/lib/f1/countries';
import { resolveTeamColor } from '@/lib/f1/team-colors';
import { cn } from '@/lib/utils/cn';
import type { DriverResult } from '@/lib/validation/f1-schemas';

const NOT_CLASSIFIED = 'NC';

function GridDelta({ result }: { result: DriverResult }): JSX.Element {
  const gained = positionsGained(result);
  if (gained === null || gained === 0) {
    return <span className="text-muted/60">–</span>;
  }
  const isGain = gained > 0;
  return (
    <span className={isGain ? 'text-success' : 'text-destructive'}>
      {isGain ? '▲' : '▼'}
      {Math.abs(gained)}
    </span>
  );
}

interface ClassificationRowProps {
  result: DriverResult;
  winner: DriverResult | undefined;
}

/** One finishing position: driver, team, grid movement, time/gap and points. */
export function ClassificationRow({ result, winner }: ClassificationRowProps): JSX.Element {
  const color = resolveTeamColor(result.teamColor, result.teamName);
  return (
    <tr className="border-b border-white/[0.06] last:border-b-0">
      <td className="py-2.5 pl-4 pr-2 font-mono text-sm tabular-nums text-muted">{result.position ?? NOT_CLASSIFIED}</td>
      <td className="py-2.5 pr-3">
        <span className="flex items-center gap-3">
          <DriverAvatar name={result.fullName} headshotUrl={result.headshotUrl} teamColor={color} size="sm" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-heading">{result.fullName}</span>
              <CountryFlag iso2={nationalityIso2(result.countryCode)} label={result.countryCode ?? ''} />
            </span>
            <span className="flex items-center gap-1.5 truncate text-xs text-muted sm:hidden">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {result.teamName}
            </span>
          </span>
        </span>
      </td>
      <td className="hidden py-2.5 pr-3 sm:table-cell">
        <span className="flex items-center gap-2 text-sm text-muted">
          <span aria-hidden className="h-3 w-1 rounded-sm" style={{ backgroundColor: color }} />
          {result.teamName}
        </span>
      </td>
      <td className="hidden py-2.5 pr-3 font-mono text-xs tabular-nums md:table-cell">
        <span className="text-muted">{gridLabel(result)}</span> <GridDelta result={result} />
      </td>
      <td className={cn('py-2.5 pr-3 font-mono text-xs tabular-nums', isClassifiedFinish(result) ? 'text-foreground/80' : 'text-warning')}>
        {timeOrGapLabel(result, winner)}
      </td>
      <td className="py-2.5 pr-4 text-right font-mono text-sm tabular-nums text-heading">
        {result.points > 0 ? result.points : '–'}
      </td>
    </tr>
  );
}
