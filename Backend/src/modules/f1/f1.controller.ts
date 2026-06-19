import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { F1Service } from './f1.service';
import type {
  SeasonScheduleDto,
  SessionResultsDto,
} from './dto/f1-response.dto';

/**
 * F1 read endpoints. Protected by the global JwtAuthGuard (authenticated users
 * only). Data is fetched from the FastF1 data service and cached.
 */
@Controller('f1')
export class F1Controller {
  constructor(private readonly f1Service: F1Service) {}

  @Get('seasons/:season/events')
  getSeasonEvents(
    @Param('season', ParseIntPipe) season: number,
  ): Promise<SeasonScheduleDto> {
    return this.f1Service.getSeasonEvents(season);
  }

  @Get('seasons/:season/rounds/:round/sessions/:session/results')
  getSessionResults(
    @Param('season', ParseIntPipe) season: number,
    @Param('round', ParseIntPipe) round: number,
    @Param('session') session: string,
  ): Promise<SessionResultsDto> {
    return this.f1Service.getSessionResults(season, round, session);
  }
}
