import { SessionCode } from './race-archive';

interface ReplayRoute {
  season: number;
  round: number;
  session?: SessionCode;
}

/** Race center URL for a specific session replay (race session is the default). */
export function raceReplayHref({ season, round, session = SessionCode.Race }: ReplayRoute): string {
  const params = new URLSearchParams({ season: String(season), round: String(round) });
  if (session !== SessionCode.Race) {
    params.set('session', session);
  }
  return `/race?${params.toString()}`;
}

/** Archive page for one Grand Prix (classification, podium, circuit). */
export function raceResultHref(
  season: number,
  round: number,
  session: SessionCode = SessionCode.Race,
): string {
  const path = `/history/${season}/${round}`;
  return session === SessionCode.Race ? path : `${path}?session=${session}`;
}

/** Archive index filtered to one season. */
export function historySeasonHref(season: number): string {
  return `/history?season=${season}`;
}
