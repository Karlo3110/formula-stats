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

export type EventSummary = z.infer<typeof EventSummarySchema>;
export type SeasonSchedule = z.infer<typeof SeasonScheduleSchema>;
export type DriverResult = z.infer<typeof DriverResultSchema>;
export type SessionResults = z.infer<typeof SessionResultsSchema>;
export type TrackMap = z.infer<typeof TrackMapSchema>;
