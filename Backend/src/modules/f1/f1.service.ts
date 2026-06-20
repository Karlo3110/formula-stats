import { Injectable } from '@nestjs/common';

import { CacheService } from '@/redis/cache.service';

import { DataServiceClient } from './data-service.client';
import { F1Repository } from './f1.repository';
import {
  eventsToSeasonScheduleDto,
  resultsToSessionResultsDto,
  toSeasonScheduleDto,
  toSessionResultsDto,
  toTrackMapDto,
  trackMapRowToDto,
  type SeasonScheduleDto,
  type SessionResultsDto,
  type TrackMapDto,
} from './dto/f1-response.dto';

const SCHEDULE_TTL_SECONDS = 3600;
const RESULTS_TTL_SECONDS = 86_400;
const TRACK_MAP_TTL_SECONDS = 604_800;

/**
 * Serves F1 data through three tiers so clients never hit FastF1 directly:
 * Redis (hot cache) → PostgreSQL (durable history) → data service (FastF1).
 * Anything fetched upstream is persisted, building a permanent race archive.
 */
@Injectable()
export class F1Service {
  constructor(
    private readonly dataService: DataServiceClient,
    private readonly repository: F1Repository,
    private readonly cache: CacheService,
  ) {}

  async getSeasonEvents(season: number): Promise<SeasonScheduleDto> {
    const key = `f1:events:${season}`;
    const cached = await this.cache.get<SeasonScheduleDto>(key);
    if (cached) {
      return cached;
    }

    const stored = await this.repository.findEventsBySeason(season);
    if (stored.length > 0) {
      return this.cacheAndReturn(key, eventsToSeasonScheduleDto(season, stored), SCHEDULE_TTL_SECONDS);
    }

    const dto = toSeasonScheduleDto(await this.dataService.getSeasonEvents(season));
    await this.repository.replaceEvents(
      season,
      dto.events.map((event) => ({
        roundNumber: event.roundNumber,
        eventName: event.eventName,
        country: event.country,
        location: event.location,
        eventDate: event.eventDate ? new Date(event.eventDate) : null,
      })),
    );
    return this.cacheAndReturn(key, dto, SCHEDULE_TTL_SECONDS);
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

    const stored = await this.repository.findResults(season, round, session);
    if (stored.length > 0) {
      return this.cacheAndReturn(
        key,
        resultsToSessionResultsDto(season, round, session, stored),
        RESULTS_TTL_SECONDS,
      );
    }

    const dto = toSessionResultsDto(
      await this.dataService.getSessionResults(season, round, session),
    );
    await this.repository.replaceResults(season, round, session, dto.results);
    return this.cacheAndReturn(key, dto, RESULTS_TTL_SECONDS);
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

    const stored = await this.repository.findTrackMap(season, round, session);
    if (stored) {
      return this.cacheAndReturn(key, trackMapRowToDto(stored), TRACK_MAP_TTL_SECONDS);
    }

    const dto = toTrackMapDto(
      await this.dataService.getTrackMap(season, round, session),
    );
    await this.repository.replaceTrackMap(season, round, session, dto.track);
    return this.cacheAndReturn(key, dto, TRACK_MAP_TTL_SECONDS);
  }

  private async cacheAndReturn<T>(
    key: string,
    dto: T,
    ttlSeconds: number,
  ): Promise<T> {
    await this.cache.set(key, dto, ttlSeconds);
    return dto;
  }
}
