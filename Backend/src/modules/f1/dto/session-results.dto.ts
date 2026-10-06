import type { F1SessionResult } from '@prisma/client';

import type { SessionResultsPayload } from '../f1.schemas';

/**
 * Bump when DriverResultDto gains fields sourced from the data service, so
 * results persisted before the change are re-fetched instead of served
 * without them. v1: grid, laps, race time, team colour, headshot, nationality.
 */
export const RESULTS_DETAIL_VERSION = 1;

export interface DriverResultDto {
  position: number | null;
  driverNumber: string;
  abbreviation: string;
  fullName: string;
  teamName: string;
  points: number;
  status: string;
  gridPosition: number | null;
  laps: number | null;
  /** Total race time in seconds; only for cars on the lead lap. */
  timeSeconds: number | null;
  teamColor: string | null;
  headshotUrl: string | null;
  /** Driver nationality, ISO 3166-1 alpha-3. */
  countryCode: string | null;
}

export interface SessionResultsDto {
  season: number;
  roundNumber: number;
  session: string;
  results: DriverResultDto[];
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
      gridPosition: result.grid_position,
      laps: result.laps,
      timeSeconds: result.time_seconds,
      teamColor: result.team_color,
      headshotUrl: result.headshot_url,
      countryCode: result.country_code,
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
      gridPosition: row.gridPosition,
      laps: row.laps,
      timeSeconds: row.timeSeconds,
      teamColor: row.teamColor,
      headshotUrl: row.headshotUrl,
      countryCode: row.countryCode,
    })),
  };
}

/** Stored rows are served only if they were written with the current fields. */
export function areStoredResultsCurrent(
  rows: ReadonlyArray<Pick<F1SessionResult, 'detailVersion'>>,
): boolean {
  return (
    rows.length > 0 &&
    rows.every((row) => row.detailVersion >= RESULTS_DETAIL_VERSION)
  );
}
