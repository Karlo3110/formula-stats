import { httpClient } from '@/lib/http-client';
import {
  ReplaySessionSchema,
  SeasonScheduleSchema,
  SessionResultsSchema,
  TrackMapSchema,
  type ReplaySession,
  type SeasonSchedule,
  type SessionResults,
  type TrackMap,
} from '@/lib/validation/f1-schemas';

export const f1Service = {
  async getSeasonEvents(season: number): Promise<SeasonSchedule> {
    const data = await httpClient.get<unknown>(`/f1/seasons/${season}/events`);
    return SeasonScheduleSchema.parse(data);
  },

  async getSessionResults(
    season: number,
    round: number,
    session: string,
  ): Promise<SessionResults> {
    const data = await httpClient.get<unknown>(
      `/f1/seasons/${season}/rounds/${round}/sessions/${session}/results`,
    );
    return SessionResultsSchema.parse(data);
  },

  async getTrackMap(
    season: number,
    round: number,
    session: string,
  ): Promise<TrackMap> {
    const data = await httpClient.get<unknown>(
      `/f1/seasons/${season}/rounds/${round}/sessions/${session}/track-map`,
    );
    return TrackMapSchema.parse(data);
  },

  async getReplay(
    season: number,
    round: number,
    session: string,
  ): Promise<ReplaySession> {
    const data = await httpClient.get<unknown>(
      `/f1/seasons/${season}/rounds/${round}/sessions/${session}/replay`,
    );
    return ReplaySessionSchema.parse(data);
  },
} as const;
