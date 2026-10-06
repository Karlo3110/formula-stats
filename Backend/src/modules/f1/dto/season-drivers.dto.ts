import type { SeasonDriversPayload } from '../f1.schemas';

export interface DriverProfileDto {
  code: string;
  number: string | null;
  fullName: string;
  teamName: string | null;
  teamColor: string | null;
  headshotUrl: string | null;
  /** Driver nationality, ISO 3166-1 alpha-3. */
  countryCode: string | null;
}

export interface SeasonDriversDto {
  season: number;
  /** Race the profiles were taken from; null when none is published yet. */
  roundNumber: number | null;
  drivers: DriverProfileDto[];
}

export function toSeasonDriversDto(
  payload: SeasonDriversPayload,
): SeasonDriversDto {
  return {
    season: payload.season,
    roundNumber: payload.round_number,
    drivers: payload.drivers.map((driver) => ({
      code: driver.code,
      number: driver.number,
      fullName: driver.full_name,
      teamName: driver.team_name,
      teamColor: driver.team_color,
      headshotUrl: driver.headshot_url,
      countryCode: driver.country_code,
    })),
  };
}
