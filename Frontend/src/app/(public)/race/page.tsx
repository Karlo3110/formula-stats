import type { Metadata } from 'next';
import type { JSX } from 'react';

import { RaceExplainer } from '@/components/race/RaceExplainer';
import { RaceView } from '@/components/race/RaceView';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Live Race',
  description:
    'Replay Formula 1 Grand Prix sessions in 3D from real telemetry — follow any driver around the circuit and watch the order change lap by lap.',
  path: '/race',
});

interface RacePageProps {
  searchParams: Promise<{ season?: string; round?: string; session?: string }>;
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function RacePage({
  searchParams,
}: RacePageProps): Promise<JSX.Element> {
  const { season, round, session } = await searchParams;
  return (
    <>
      <RaceView
        season={toInt(season)}
        round={toInt(round)}
        session={session ?? 'R'}
      />
      <RaceExplainer />
    </>
  );
}
