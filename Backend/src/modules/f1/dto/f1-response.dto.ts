import type { F1Event, F1SessionResult, F1TrackMap } from '@prisma/client';

import type {
  ReplaySessionPayload,
  SeasonSchedulePayload,
  SessionResultsPayload,
  TrackMapPayload,
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

export interface TrackMapDto {
  season: number;
  roundNumber: number;
  session: string;
  track: number[][];
}

export function toTrackMapDto(payload: TrackMapPayload): TrackMapDto {
  return {
    season: payload.season,
    roundNumber: payload.round_number,
    session: payload.session,
    track: payload.track,
  };
}

export interface ReplayDriverDto {
  code: string;
  team: string;
  color: string | null;
  samples: number[][];
}

export interface ReplaySessionDto {
  season: number;
  roundNumber: number;
  session: string;
  durationSeconds: number;
  track: number[][];
  drivers: ReplayDriverDto[];
}

export function toReplaySessionDto(
  payload: ReplaySessionPayload,
): ReplaySessionDto {
  return {
    season: payload.season,
    roundNumber: payload.round_number,
    session: payload.session,
    durationSeconds: payload.durationSeconds,
    track: payload.track,
    drivers: payload.drivers,
  };
}

export function eventsToSeasonScheduleDto(
  season: number,
  rows: F1Event[],
): SeasonScheduleDto {
  return {
    season,
    events: rows.map((row) => ({
      roundNumber: row.roundNumber,
      country: row.country,
      location: row.location,
      eventName: row.eventName,
      eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    })),
  };
}

export function resultsToSessionResultsDto(
  season: number,
  roundNumber: number,
  session: string,
  rows: F1SessionResult[],
): SessionResultsDto {
  return {
    season,
    roundNumber,
    session,
    results: rows.map((row) => ({
      position: row.position,
      driverNumber: row.driverNumber,
      abbreviation: row.abbreviation,
      fullName: row.fullName,
      teamName: row.teamName,
      points: row.points,
      status: row.status,
    })),
  };
}

export function trackMapRowToDto(row: F1TrackMap): TrackMapDto {
  return {
    season: row.season,
    roundNumber: row.roundNumber,
    session: row.session,
    track: toNumberMatrix(row.points),
  };
}

function toNumberMatrix(value: unknown): number[][] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (row): row is number[] =>
      Array.isArray(row) && row.every((n) => typeof n === 'number'),
  );
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
