'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useTransition, type JSX } from 'react';

import { SeasonTabs } from '@/components/f1/SeasonTabs';
import { Eyebrow } from '@/components/ui/Typography';
import { usePrefetchSchedule } from '@/hooks/use-f1';
import { historySeasonHref } from '@/lib/f1/routes';
import { getArchiveSeasons } from '@/lib/f1/seasons';
import { cn } from '@/lib/utils/cn';

import { SeasonCalendar } from './SeasonCalendar';
import { SeasonStandings } from './SeasonStandings';

interface HistoryViewProps {
  season: number;
}

/** Race archive: pick a season, open any finished Grand Prix, see standings. */
export function HistoryView({ season }: HistoryViewProps): JSX.Element {
  const router = useRouter();
  const seasons = useMemo(() => getArchiveSeasons(), []);
  const prefetchSchedule = usePrefetchSchedule();
  const [isSwitching, startTransition] = useTransition();

  function selectSeason(next: number): void {
    startTransition(() => router.push(historySeasonHref(next), { scroll: false }));
  }

  return (
    <div className="mx-auto max-w-[90rem] px-2 sm:px-6">
      <header className="pb-8 pt-6">
        <Eyebrow className="text-primary">Race archive</Eyebrow>
        <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] text-heading sm:text-8xl">
          Season {season}
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Every round of the season. Open a finished Grand Prix for its full classification, or
          replay any session in 3D.
        </p>
        <SeasonTabs
          seasons={seasons}
          active={season}
          onSelect={selectSeason}
          onPreview={prefetchSchedule}
          className="mt-8"
        />
      </header>

      <div className={cn('transition-opacity', isSwitching && 'opacity-60')}>
        <SeasonCalendar season={season} />
        <SeasonStandings season={season} />
      </div>
    </div>
  );
}
