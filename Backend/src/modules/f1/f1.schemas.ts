import { z } from 'zod';

/**
 * Schemas for the FastF1 data service payloads (snake_case). The response is
 * untrusted input crossing a boundary, so it is parsed before use
 * (.claude/rules/02-typescript.md §4).
 */
export const EventSummarySchema = z.object({
  round_number: z.number().int(),
  country: z.string(),
  location: z.string(),
  event_name: z.string(),
  event_date: z.string().nullable(),
});

export const SeasonScheduleSchema = z.object({
  season: z.number().int(),
  events: z.array(EventSummarySchema),
});

export const DriverResultSchema = z.object({
  position: z.number().int().nullable(),
  driver_number: z.string(),
  abbreviation: z.string(),
  full_name: z.string(),
  team_name: z.string(),
  points: z.number(),
  status: z.string(),
  grid_position: z.number().int().nullable().default(null),
  laps: z.number().int().nullable().default(null),
  time_seconds: z.number().nullable().default(null),
  team_color: z.string().nullable().default(null),
  headshot_url: z.string().url().nullable().default(null),
  country_code: z.string().nullable().default(null),
});

export const SessionResultsSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  results: z.array(DriverResultSchema),
});

export const DriverProfileSchema = z.object({
  code: z.string(),
  number: z.string().nullable(),
  full_name: z.string(),
  team_name: z.string().nullable(),
  team_color: z.string().nullable(),
  headshot_url: z.string().url().nullable(),
  country_code: z.string().nullable(),
});

export const SeasonDriversSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int().nullable(),
  drivers: z.array(DriverProfileSchema),
});

export type SeasonDriversPayload = z.infer<typeof SeasonDriversSchema>;

export const TrackMapSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  track: z.array(z.array(z.number())),
});

/** Per-sample columns: one entry per replay sample (see the data service model). */
export const ReplayDriverSchema = z.object({
  code: z.string(),
  number: z.string(),
  team: z.string(),
  color: z.string().nullable(),
  progress: z.array(z.number()),
  lateral: z.array(z.number()),
  speed: z.array(z.number()),
  position: z.array(z.number()),
  gap: z.array(z.number().nullable()),
  status: z.array(z.number()),
  laps: z.array(z.tuple([z.number(), z.number().nullable()])),
});

export const ReplayMessageSchema = z.object({
  time: z.number(),
  category: z.string(),
  message: z.string(),
  flag: z.string().nullable(),
  scope: z.string().nullable(),
});

export const ReplaySessionSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  sessionName: z.string(),
  sessionKind: z.enum(['race', 'qualifying', 'practice']),
  durationSeconds: z.number(),
  sampleInterval: z.number().positive(),
  lightsOutSeconds: z.number().nullable(),
  totalLaps: z.number().int().nullable(),
  trackWidth: z.number(),
  lapLength: z.number().positive(),
  track: z.array(z.array(z.number())),
  drivers: z.array(ReplayDriverSchema),
  messages: z.array(ReplayMessageSchema).default([]),
});

export const WeekendSessionSchema = z.object({
  name: z.string(),
  start_utc: z.string().nullable(),
});

export const WeekendEventSchema = z.object({
  round_number: z.number().int(),
  country: z.string(),
  location: z.string(),
  event_name: z.string(),
  sessions: z.array(WeekendSessionSchema),
});

export const WeekendScheduleSchema = z.object({
  season: z.number().int(),
  events: z.array(WeekendEventSchema),
});

export type WeekendSchedulePayload = z.infer<typeof WeekendScheduleSchema>;

export const DriverStandingRowSchema = z.object({
  position: z.number().int(),
  code: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  team: z.string(),
  points: z.number(),
  wins: z.number().int(),
});

export const ConstructorStandingRowSchema = z.object({
  position: z.number().int(),
  name: z.string(),
  points: z.number(),
  wins: z.number().int(),
});

export const SeasonStandingsSchema = z.object({
  season: z.number().int(),
  drivers: z.array(DriverStandingRowSchema),
  constructors: z.array(ConstructorStandingRowSchema),
});

export type SeasonStandingsPayload = z.infer<typeof SeasonStandingsSchema>;

export type SeasonSchedulePayload = z.infer<typeof SeasonScheduleSchema>;
export type SessionResultsPayload = z.infer<typeof SessionResultsSchema>;
export type TrackMapPayload = z.infer<typeof TrackMapSchema>;
export type ReplaySessionPayload = z.infer<typeof ReplaySessionSchema>;
