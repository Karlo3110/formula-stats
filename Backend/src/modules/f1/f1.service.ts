import { Injectable } from '@nestjs/common';

import { CacheService } from '@/redis/cache.service';

import { DataServiceClient } from './data-service.client';
import {
  toSeasonScheduleDto,
  toSessionResultsDto,
  toTrackMapDto,
  type SeasonScheduleDto,
  type SessionResultsDto,
  type TrackMapDto,
} from './dto/f1-response.dto';

const SCHEDULE_TTL_SECONDS = 3600;
const RESULTS_TTL_SECONDS = 86_400;
const TRACK_MAP_TTL_SECONDS = 604_800;

@Injectable()
export class F1Service {
  constructor(
    private readonly dataService: DataServiceClient,
    private readonly cache: CacheService,
  ) {}

  async getSeasonEvents(season: number): Promise<SeasonScheduleDto> {
    const key = `f1:events:${season}`;
    const cached = await this.cache.get<SeasonScheduleDto>(key);
    if (cached) {
      return cached;
    }
    const dto = toSeasonScheduleDto(
      await this.dataService.getSeasonEvents(season),
    );
    await this.cache.set(key, dto, SCHEDULE_TTL_SECONDS);
    return dto;
  }

  async getSessionResults(
    season: number,
    round: number,
    session: string,
  ): Promise<SessionResultsDto> {
    const key = `f1:results:${season}:${round}:${session}`;
    const cached = await this.cache.get<SessionResultsDto>(key);
    if (cached) {
      return cached;
    }
    const dto = toSessionResultsDto(
      await this.dataService.getSessionResults(season, round, session),
    );
    await this.cache.set(key, dto, RESULTS_TTL_SECONDS);
    return dto;
  }

  async getTrackMap(
    season: number,
    round: number,
    session: string,
  ): Promise<TrackMapDto> {
    const key = `f1:trackmap:${season}:${round}:${session}`;
    const cached = await this.cache.get<TrackMapDto>(key);
    if (cached) {
      return cached;
    }
    const dto = toTrackMapDto(
      await this.dataService.getTrackMap(season, round, session),
    );
    await this.cache.set(key, dto, TRACK_MAP_TTL_SECONDS);
    return dto;
  }
}
