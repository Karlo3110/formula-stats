import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';

import { F1Service } from './f1.service';
import type {
  ReplaySessionDto,
  SeasonScheduleDto,
  SeasonStandingsDto,
  SessionResultsDto,
  TrackMapDto,
  WeekendScheduleDto,
} from './dto/f1-response.dto';

/**
 * F1 read endpoints. Public — F1 data is not user-specific, so the anonymous
 * dashboard can read it. The upstream data service stays protected by the
 * internal key. Results are fetched from the FastF1 data service and cached.
 */
@Public()
@Controller('f1')
export class F1Controller {
  constructor(private readonly f1Service: F1Service) {}

  @Get('seasons/:season/events')
  getSeasonEvents(
    @Param('season', ParseIntPipe) season: number,
  ): Promise<SeasonScheduleDto> {
    return this.f1Service.getSeasonEvents(season);
  }

  @Get('seasons/:season/schedule')
  getSchedule(
    @Param('season', ParseIntPipe) season: number,
  ): Promise<WeekendScheduleDto> {
    return this.f1Service.getSchedule(season);
  }

  @Get('seasons/:season/standings')
  getStandings(
    @Param('season', ParseIntPipe) season: number,
  ): Promise<SeasonStandingsDto> {
    return this.f1Service.getStandings(season);
  }

  @Get('seasons/:season/rounds/:round/sessions/:session/results')
  getSessionResults(
    @Param('season', ParseIntPipe) season: number,
    @Param('round', ParseIntPipe) round: number,
    @Param('session') session: string,
  ): Promise<SessionResultsDto> {
    return this.f1Service.getSessionResults(season, round, session);
  }

  @Get('seasons/:season/rounds/:round/sessions/:session/track-map')
  getTrackMap(
    @Param('season', ParseIntPipe) season: number,
    @Param('round', ParseIntPipe) round: number,
    @Param('session') session: string,
  ): Promise<TrackMapDto> {
    return this.f1Service.getTrackMap(season, round, session);
  }

  @Get('seasons/:season/rounds/:round/sessions/:session/replay')
  getReplay(
    @Param('season', ParseIntPipe) season: number,
    @Param('round', ParseIntPipe) round: number,
    @Param('session') session: string,
  ): Promise<ReplaySessionDto> {
    return this.f1Service.getReplay(season, round, session);
  }
}
