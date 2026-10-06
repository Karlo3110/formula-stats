'use client';

import type { JSX, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Text } from '@/components/ui/Typography';
import { useSessionResults } from '@/hooks/use-f1';
import { podiumOf, summarizeClassification } from '@/lib/f1/classification';
import { SessionCode, type ArchiveEntry } from '@/lib/f1/race-archive';

import { ClassificationTable } from './ClassificationTable';
import { HeadlineFigures } from './HeadlineFigures';
import { Podium } from './Podium';
import { RaceResultHero } from './RaceResultHero';

interface RaceResultBodyProps {
  season: number;
  entry: ArchiveEntry;
  /** Null when no session of this weekend has been run yet. */
  session: SessionCode | null;
  actions: ReactNode;
  circuit: ReactNode;
}

/** Hero plus podium and classification for the selected session. */
export function RaceResultBody({ season, entry, session, actions, circuit }: RaceResultBodyProps): JSX.Element {
  const resultsQuery = useSessionResults(season, entry.event.roundNumber, session ?? SessionCode.Race, {
    enabled: session !== null,
  });
  const results = resultsQuery.data?.results ?? [];
  const podium = podiumOf(results);
  const aside = (
    <>
      {circuit}
      {results.length > 0 ? <HeadlineFigures summary={summarizeClassification(results)} /> : null}
    </>
  );

  return (
    <>
      <RaceResultHero
        season={season}
        event={entry.event}
        raceStart={entry.raceStart}
        winner={podium[0] ?? null}
        actions={actions}
        aside={aside}
      />
      {session === null ? (
        <Text variant="muted">This Grand Prix hasn’t been run yet. Results appear after the chequered flag.</Text>
      ) : resultsQuery.isLoading ? (
        <div className="flex min-h-[16rem] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : resultsQuery.isError || results.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <Text variant="muted">The classification for this session isn’t available right now.</Text>
          <Button variant="secondary" size="sm" onClick={() => void resultsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          <Podium podium={podium} />
          <ClassificationTable results={results} />
        </div>
      )}
    </>
  );
}
