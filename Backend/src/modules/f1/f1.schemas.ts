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
});

export const SessionResultsSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  results: z.array(DriverResultSchema),
});

export const TrackMapSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  track: z.array(z.array(z.number())),
});

export const ReplayDriverSchema = z.object({
  code: z.string(),
  team: z.string(),
  color: z.string().nullable(),
  samples: z.array(z.array(z.number())),
});

export const ReplaySessionSchema = z.object({
  season: z.number().int(),
  round_number: z.number().int(),
  session: z.string(),
  durationSeconds: z.number(),
  track: z.array(z.array(z.number())),
  drivers: z.array(ReplayDriverSchema),
});

export type SeasonSchedulePayload = z.infer<typeof SeasonScheduleSchema>;
export type SessionResultsPayload = z.infer<typeof SessionResultsSchema>;
export type TrackMapPayload = z.infer<typeof TrackMapSchema>;
export type ReplaySessionPayload = z.infer<typeof ReplaySessionSchema>;
