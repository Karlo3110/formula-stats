import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { RaceResultView } from '@/components/race-result/RaceResultView';
import { parseSessionCode } from '@/lib/f1/race-archive';
import { raceResultHref } from '@/lib/f1/routes';
import { isArchiveSeason } from '@/lib/f1/seasons';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

const MAX_ROUNDS = 30;

interface RaceResultPageProps {
  params: Promise<{ season: string; round: string }>;
  searchParams: Promise<{ session?: string }>;
}

interface RaceRoute {
  season: number;
  round: number;
}

function parseRoute(season: string, round: string): RaceRoute | null {
  const seasonNumber = Number(season);
  const roundNumber = Number(round);
  const isValidRound = Number.isInteger(roundNumber) && roundNumber >= 1 && roundNumber <= MAX_ROUNDS;
  return isArchiveSeason(seasonNumber) && isValidRound ? { season: seasonNumber, round: roundNumber } : null;
}

export async function generateMetadata({ params }: RaceResultPageProps): Promise<Metadata> {
  const { season, round } = await params;
  const route = parseRoute(season, round);
  if (!route) return {};
  return buildPageMetadata({
    title: `${route.season} Round ${route.round} Results`,
    description: `Race classification, podium and circuit for round ${route.round} of the ${route.season} Formula 1 season, with a full 3D replay of the race.`,
    path: raceResultHref(route.season, route.round),
  });
}

export default async function RaceResultPage({ params, searchParams }: RaceResultPageProps): Promise<JSX.Element> {
  const [{ season, round }, { session }] = await Promise.all([params, searchParams]);
  const route = parseRoute(season, round);
  if (!route) {
    notFound();
  }
  return <RaceResultView season={route.season} round={route.round} session={parseSessionCode(session)} />;
}
