import { httpClient } from '@/lib/http-client';
import {
  SeasonScheduleSchema,
  SessionResultsSchema,
  type SeasonSchedule,
  type SessionResults,
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
} as const;
