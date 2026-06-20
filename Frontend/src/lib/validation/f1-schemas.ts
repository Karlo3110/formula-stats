import { z } from 'zod';

export const EventSummarySchema = z.object({
  roundNumber: z.number().int(),
  country: z.string(),
  location: z.string(),
  eventName: z.string(),
  eventDate: z.string().nullable(),
});

export const SeasonScheduleSchema = z.object({
  season: z.number().int(),
  events: z.array(EventSummarySchema),
});

export const DriverResultSchema = z.object({
  position: z.number().int().nullable(),
  driverNumber: z.string(),
  abbreviation: z.string(),
  fullName: z.string(),
  teamName: z.string(),
  points: z.number(),
  status: z.string(),
});

export const SessionResultsSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  results: z.array(DriverResultSchema),
});

export const TrackMapSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  track: z.array(z.tuple([z.number(), z.number()])),
});

export const ReplayDriverSchema = z.object({
  code: z.string(),
  team: z.string(),
  color: z.string().nullable(),
  samples: z.array(z.array(z.number())),
});

export const ReplaySessionSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  durationSeconds: z.number(),
  lightsOutSeconds: z.number(),
  trackWidth: z.number(),
  carScale: z.number(),
  track: z.array(z.tuple([z.number(), z.number()])),
  drivers: z.array(ReplayDriverSchema),
});

export type ReplayDriver = z.infer<typeof ReplayDriverSchema>;
export type ReplaySession = z.infer<typeof ReplaySessionSchema>;

export const WeekendSessionSchema = z.object({
  name: z.string(),
  startUtc: z.string().nullable(),
});

export const WeekendEventSchema = z.object({
  roundNumber: z.number().int(),
  country: z.string(),
  location: z.string(),
  eventName: z.string(),
  sessions: z.array(WeekendSessionSchema),
});

export const WeekendScheduleSchema = z.object({
  season: z.number().int(),
  events: z.array(WeekendEventSchema),
});

export type WeekendSession = z.infer<typeof WeekendSessionSchema>;
export type WeekendEvent = z.infer<typeof WeekendEventSchema>;
export type WeekendSchedule = z.infer<typeof WeekendScheduleSchema>;

export const DriverStandingRowSchema = z.object({
  position: z.number().int(),
  code: z.string(),
  givenName: z.string(),
  familyName: z.string(),
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

export type DriverStandingRow = z.infer<typeof DriverStandingRowSchema>;
export type ConstructorStandingRow = z.infer<typeof ConstructorStandingRowSchema>;
export type SeasonStandings = z.infer<typeof SeasonStandingsSchema>;

export type EventSummary = z.infer<typeof EventSummarySchema>;
export type SeasonSchedule = z.infer<typeof SeasonScheduleSchema>;
export type DriverResult = z.infer<typeof DriverResultSchema>;
export type SessionResults = z.infer<typeof SessionResultsSchema>;
export type TrackMap = z.infer<typeof TrackMapSchema>;
