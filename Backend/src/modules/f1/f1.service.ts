import { Injectable } from '@nestjs/common';

import { CacheService } from '@/redis/cache.service';

import { DataServiceClient } from './data-service.client';
import { F1Repository } from './f1.repository';
import {
  eventsToSeasonScheduleDto,
  resultsToSessionResultsDto,
  toReplaySessionDto,
  toSeasonScheduleDto,
  toSeasonStandingsDto,
  toSessionResultsDto,
  toTrackMapDto,
  toWeekendScheduleDto,
  type ReplaySessionDto,
  type SeasonScheduleDto,
  type SeasonStandingsDto,
  type SessionResultsDto,
  type TrackMapDto,
  type WeekendScheduleDto,
} from './dto/f1-response.dto';

const SCHEDULE_TTL_SECONDS = 3600;
const WEEKEND_TTL_SECONDS = 3600;
const WEEKEND_VERSION = 'v1';
const STANDINGS_TTL_SECONDS = 3600;
const STANDINGS_VERSION = 'v1';
const RESULTS_TTL_SECONDS = 86_400;
const TRACK_MAP_TTL_SECONDS = 604_800;
const REPLAY_TTL_SECONDS = 604_800;
// Bump when the derived geometry algorithms change, to invalidate caches.
const TRACK_MAP_VERSION = 'v2';
const REPLAY_VERSION = 'v7';

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
    // Track outline is derived render geometry (algorithm may change), so it is
    // cached in Redis under a version key rather than persisted as history.
    const key = `f1:trackmap:${TRACK_MAP_VERSION}:${season}:${round}:${session}`;
    const cached = await this.cache.get<TrackMapDto>(key);
    if (cached) {
      return cached;
    }

    const dto = toTrackMapDto(
      await this.dataService.getTrackMap(season, round, session),
    );
    return this.cacheAndReturn(key, dto, TRACK_MAP_TTL_SECONDS);
  }

  async getSchedule(season: number): Promise<WeekendScheduleDto> {
    const key = `f1:schedule:${WEEKEND_VERSION}:${season}`;
    const cached = await this.cache.get<WeekendScheduleDto>(key);
    if (cached) {
      return cached;
    }
    const dto = toWeekendScheduleDto(await this.dataService.getSchedule(season));
    return this.cacheAndReturn(key, dto, WEEKEND_TTL_SECONDS);
  }

  async getStandings(season: number): Promise<SeasonStandingsDto> {
    const key = `f1:standings:${STANDINGS_VERSION}:${season}`;
    const cached = await this.cache.get<SeasonStandingsDto>(key);
    if (cached) {
      return cached;
    }
    const dto = toSeasonStandingsDto(await this.dataService.getStandings(season));
    return this.cacheAndReturn(key, dto, STANDINGS_TTL_SECONDS);
  }

  async getReplay(
    season: number,
    round: number,
    session: string,
  ): Promise<ReplaySessionDto> {
    const key = `f1:replay:${REPLAY_VERSION}:${season}:${round}:${session}`;
    const cached = await this.cache.get<ReplaySessionDto>(key);
    if (cached) {
      return cached;
    }

    const dto = toReplaySessionDto(
      await this.dataService.getReplay(season, round, session),
    );
    return this.cacheAndReturn(key, dto, REPLAY_TTL_SECONDS);
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
