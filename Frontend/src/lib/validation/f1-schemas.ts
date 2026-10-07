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
  gridPosition: z.number().int().nullable().default(null),
  laps: z.number().int().nullable().default(null),
  /** Total race time in seconds; only for cars on the lead lap. */
  timeSeconds: z.number().nullable().default(null),
  teamColor: z.string().nullable().default(null),
  headshotUrl: z.string().nullable().default(null),
  /** Driver nationality, three-letter code (ISO or IOC/FIA). */
  countryCode: z.string().nullable().default(null),
});

export const DriverProfileSchema = z.object({
  code: z.string(),
  number: z.string().nullable(),
  fullName: z.string(),
  teamName: z.string().nullable(),
  teamColor: z.string().nullable(),
  headshotUrl: z.string().nullable(),
  countryCode: z.string().nullable(),
});

export const SeasonDriversSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int().nullable(),
  drivers: z.array(DriverProfileSchema),
});

export type DriverProfile = z.infer<typeof DriverProfileSchema>;
export type SeasonDrivers = z.infer<typeof SeasonDriversSchema>;

export const SessionResultsSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  results: z.array(DriverResultSchema),
});

// Circuit outline points: [x, elevation, y]. Tolerant of legacy [x, y] pairs.
export const TrackOutlineSchema = z.array(z.array(z.number()));

export const TrackMapSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  track: TrackOutlineSchema,
});

export const ReplayDriverSchema = z.object({
  code: z.string(),
  number: z.string(),
  team: z.string(),
  color: z.string().nullable(),
  /** Distance along the centre-line, cumulative over laps (world units). */
  progress: z.array(z.number()),
  /** Signed offset from the centre-line along its left normal (world units). */
  lateral: z.array(z.number()),
  speed: z.array(z.number()),
  position: z.array(z.number()),
  /** Race: seconds behind the leader. Qualifying/practice: off the fastest lap. */
  gap: z.array(z.number().nullable()),
  /** 0 running, 1 pit lane / garage, 2 out. */
  status: z.array(z.number().int()),
  /** Completed laps: [end on the replay clock, lap time or null]. */
  laps: z.array(z.tuple([z.number(), z.number().nullable()])),
});

export const SessionKindSchema = z.enum(['race', 'qualifying', 'practice']);

export const ReplayMessageSchema = z.object({
  /** Seconds on the shared replay clock (same axis as a driver sample's t). */
  time: z.number(),
  category: z.string(),
  message: z.string(),
  flag: z.string().nullable(),
  scope: z.string().nullable(),
});

export const ReplaySessionSchema = z.object({
  season: z.number().int(),
  roundNumber: z.number().int(),
  session: z.string(),
  sessionName: z.string(),
  sessionKind: SessionKindSchema,
  durationSeconds: z.number().positive(),
  /** Seconds between consecutive per-driver samples. */
  sampleInterval: z.number().positive(),
  /** Race start on the replay clock; null for sessions without a standing start. */
  lightsOutSeconds: z.number().nullable(),
  totalLaps: z.number().int().nullable(),
  trackWidth: z.number().positive(),
  lapLength: z.number().positive(),
  track: TrackOutlineSchema,
  drivers: z.array(ReplayDriverSchema),
  messages: z.array(ReplayMessageSchema).default([]),
});

export type ReplayDriver = z.infer<typeof ReplayDriverSchema>;
export type SessionKind = z.infer<typeof SessionKindSchema>;
export type ReplayMessage = z.infer<typeof ReplayMessageSchema>;
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
