import type { Metadata } from 'next';
import type { JSX } from 'react';

import { HistoryExplainer } from '@/components/history/HistoryExplainer';
import { HistoryView } from '@/components/history/HistoryView';
import { getCurrentSeason, isArchiveSeason } from '@/lib/f1/seasons';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Race Archive',
  description:
    'Every Formula 1 Grand Prix since 2021, season by season — race results, podiums, classifications and championship standings, with 3D replays of each start.',
  path: '/history',
});

interface HistoryPageProps {
  searchParams: Promise<{ season?: string }>;
}

function resolveSeason(value: string | undefined): number {
  const parsed = Number(value);
  return isArchiveSeason(parsed) ? parsed : getCurrentSeason();
}

export default async function HistoryPage({ searchParams }: HistoryPageProps): Promise<JSX.Element> {
  const { season } = await searchParams;
  return (
    <>
      <HistoryView season={resolveSeason(season)} />
      <HistoryExplainer />
    </>
  );
}
