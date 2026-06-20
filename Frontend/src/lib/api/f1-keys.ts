/** Typed, hierarchical query keys for F1 data. */
export const f1Keys = {
  all: ['f1'] as const,
  seasonEvents: (season: number) =>
    [...f1Keys.all, 'season-events', season] as const,
  sessionResults: (season: number, round: number, session: string) =>
    [...f1Keys.all, 'session-results', season, round, session] as const,
  trackMap: (season: number, round: number, session: string) =>
    [...f1Keys.all, 'track-map', season, round, session] as const,
  replay: (season: number, round: number, session: string) =>
    [...f1Keys.all, 'replay', season, round, session] as const,
};
