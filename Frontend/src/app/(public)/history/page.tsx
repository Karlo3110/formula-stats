import type { Metadata } from 'next';
import type { JSX } from 'react';

import { HistoryExplainer } from '@/components/history/HistoryExplainer';
import { HistoryView } from '@/components/history/HistoryView';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'History',
  description:
    'Browse past Formula 1 seasons and Grand Prix results, race by race, from the championship archive.',
  path: '/history',
});

export default function HistoryPage(): JSX.Element {
  return (
    <>
      <HistoryView />
      <HistoryExplainer />
    </>
  );
}
