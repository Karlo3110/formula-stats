import type { JSX } from 'react';

import { RaceView } from '@/components/race/RaceView';

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
    <RaceView
      season={toInt(season)}
      round={toInt(round)}
      session={session ?? 'R'}
    />
  );
}
