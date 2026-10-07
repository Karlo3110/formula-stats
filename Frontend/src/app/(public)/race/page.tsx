import type { Metadata } from 'next';
import type { JSX } from 'react';

import { RaceExplainer } from '@/components/race/RaceExplainer';
import { RaceView } from '@/components/race/RaceView';
import { parseSessionCode } from '@/lib/f1/race-archive';
import { isArchiveSeason } from '@/lib/f1/seasons';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Race Center',
  description:
    'Replay whole Formula 1 sessions in 3D from real telemetry — pick any practice, qualifying, sprint or race since 2021 and follow any driver lap by lap.',
  path: '/race',
});

interface RacePageProps {
  searchParams: Promise<{ season?: string; round?: string; session?: string }>;
}

function toPositiveInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function RacePage({ searchParams }: RacePageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const season = toPositiveInt(params.season);
  const round = toPositiveInt(params.round);
  const hasValidTarget = season !== undefined && round !== undefined && isArchiveSeason(season);

  return (
    <>
      <RaceView
        season={hasValidTarget ? season : undefined}
        round={hasValidTarget ? round : undefined}
        session={parseSessionCode(params.session)}
      />
      <RaceExplainer />
    </>
  );
}
