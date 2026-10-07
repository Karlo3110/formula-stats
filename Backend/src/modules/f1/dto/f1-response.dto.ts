import type { F1Event, F1TrackMap } from '@prisma/client';

import type {
  SeasonSchedulePayload,
  SeasonStandingsPayload,
  TrackMapPayload,
  WeekendSchedulePayload,
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

export interface WeekendSessionDto {
  name: string;
  startUtc: string | null;
}

export interface WeekendEventDto {
  roundNumber: number;
  country: string;
  location: string;
  eventName: string;
  sessions: WeekendSessionDto[];
}

export interface WeekendScheduleDto {
  season: number;
  events: WeekendEventDto[];
}

export interface DriverStandingRowDto {
  position: number;
  code: string;
  givenName: string;
  familyName: string;
  team: string;
  points: number;
  wins: number;
}

export interface ConstructorStandingRowDto {
  position: number;
  name: string;
  points: number;
  wins: number;
}

export interface SeasonStandingsDto {
  season: number;
  drivers: DriverStandingRowDto[];
  constructors: ConstructorStandingRowDto[];
}

export function toSeasonStandingsDto(
  payload: SeasonStandingsPayload,
): SeasonStandingsDto {
  return {
    season: payload.season,
    drivers: payload.drivers.map((d) => ({
      position: d.position,
      code: d.code,
      givenName: d.given_name,
      familyName: d.family_name,
      team: d.team,
      points: d.points,
      wins: d.wins,
    })),
    constructors: payload.constructors.map((c) => ({
      position: c.position,
      name: c.name,
      points: c.points,
      wins: c.wins,
    })),
  };
}

export function toWeekendScheduleDto(
  payload: WeekendSchedulePayload,
): WeekendScheduleDto {
  return {
    season: payload.season,
    events: payload.events.map((event) => ({
      roundNumber: event.round_number,
      country: event.country,
      location: event.location,
      eventName: event.event_name,
      sessions: event.sessions.map((s) => ({
        name: s.name,
        startUtc: s.start_utc,
      })),
    })),
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
