'use client';

import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useSessionResults } from '@/hooks/use-f1';
import type { DriverResult } from '@/lib/validation/f1-schemas';

import { Panel } from './Panel';

const MAX_ROWS = 10;

interface SessionResultsPanelProps {
  season: number;
  round: number;
  session: string;
}

function ResultRow({ result }: { result: DriverResult }): JSX.Element {
  return (
    <li className="flex items-center gap-3 rounded-md bg-elevated/40 px-3 py-2">
      <span className="w-5 font-display text-lg text-muted">
        {result.position ?? '–'}
      </span>
      <span className="font-semibold tabular-nums text-foreground">
        {result.abbreviation || `#${result.driverNumber}`}
      </span>
      <span className="truncate text-xs text-muted">{result.teamName}</span>
      <span className="ml-auto tabular-nums text-primary">{result.points}</span>
    </li>
  );
}

export function SessionResultsPanel({
  season,
  round,
  session,
}: SessionResultsPanelProps): JSX.Element {
  const { data, isLoading, isError } = useSessionResults(season, round, session);

  return (
    <Panel title={`Results · ${season} R${round} ${session}`}>
      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <Spinner />
          <Text variant="muted">Loading session data…</Text>
        </div>
      ) : isError || !data ? (
        <Alert variant="error">Could not load session results.</Alert>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {data.results.slice(0, MAX_ROWS).map((result) => (
            <ResultRow key={result.driverNumber} result={result} />
          ))}
        </ol>
      )}
    </Panel>
  );
}
