import type { JSX } from 'react';

import { RaceView } from '@/components/race/RaceView';

interface RacePageProps {
  searchParams: Promise<{ season?: string; round?: string; session?: string }>;
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function RacePage({
  searchParams,
}: RacePageProps): Promise<JSX.Element> {
  const { season, round, session } = await searchParams;
  return (
    <RaceView
      season={toInt(season, 2024)}
      round={toInt(round, 1)}
      session={session ?? 'R'}
    />
  );
}
