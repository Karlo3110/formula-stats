import type {
  SeasonSchedulePayload,
  SessionResultsPayload,
} from '../f1.schemas';

export interface EventSummaryDto {
  roundNumber: number;
  country: string;
  location: string;
  eventName: string;
  eventDate: string | null;
}

export interface SeasonScheduleDto {
  season: number;
  events: EventSummaryDto[];
}

export interface DriverResultDto {
  position: number | null;
  driverNumber: string;
  abbreviation: string;
  fullName: string;
  teamName: string;
  points: number;
  status: string;
}

export interface SessionResultsDto {
  season: number;
  roundNumber: number;
  session: string;
  results: DriverResultDto[];
}

export function toSeasonScheduleDto(
  payload: SeasonSchedulePayload,
): SeasonScheduleDto {
  return {
    season: payload.season,
    events: payload.events.map((event) => ({
      roundNumber: event.round_number,
      country: event.country,
      location: event.location,
      eventName: event.event_name,
      eventDate: event.event_date,
    })),
  };
}

export function toSessionResultsDto(
  payload: SessionResultsPayload,
): SessionResultsDto {
  return {
    season: payload.season,
    roundNumber: payload.round_number,
    session: payload.session,
    results: payload.results.map((result) => ({
      position: result.position,
      driverNumber: result.driver_number,
      abbreviation: result.abbreviation,
      fullName: result.full_name,
      teamName: result.team_name,
      points: result.points,
      status: result.status,
    })),
  };
}
