import type { ReplaySessionPayload } from '../f1.schemas';

export type SessionKind = 'race' | 'qualifying' | 'practice';

/** One car's per-sample columns; index i is replay time i * sampleInterval. */
export interface ReplayDriverDto {
  code: string;
  number: string;
  team: string;
  color: string | null;
  /** Distance along the circuit centre-line, cumulative over laps (world units). */
  progress: number[];
  /** Signed offset from the centre-line along its left normal (world units). */
  lateral: number[];
  speed: number[];
  position: number[];
  /** Race: seconds behind the leader. Qualifying/practice: off the fastest lap. */
  gap: (number | null)[];
  /** 0 running, 1 pit lane / garage, 2 out. */
  status: number[];
  /** Completed laps: [end on the replay clock, lap time or null]. */
  laps: [number, number | null][];
}

export interface ReplayMessageDto {
  time: number;
  category: string;
  message: string;
  flag: string | null;
  scope: string | null;
}

export interface ReplaySessionDto {
  season: number;
  roundNumber: number;
  session: string;
  sessionName: string;
  sessionKind: SessionKind;
  durationSeconds: number;
  sampleInterval: number;
  lightsOutSeconds: number | null;
  totalLaps: number | null;
  trackWidth: number;
  lapLength: number;
  track: number[][];
  drivers: ReplayDriverDto[];
  messages: ReplayMessageDto[];
}

export function toReplaySessionDto(
  payload: ReplaySessionPayload,
): ReplaySessionDto {
  return {
    season: payload.season,
    roundNumber: payload.round_number,
    session: payload.session,
    sessionName: payload.sessionName,
    sessionKind: payload.sessionKind,
    durationSeconds: payload.durationSeconds,
    sampleInterval: payload.sampleInterval,
    lightsOutSeconds: payload.lightsOutSeconds,
    totalLaps: payload.totalLaps,
    trackWidth: payload.trackWidth,
    lapLength: payload.lapLength,
    track: payload.track,
    drivers: payload.drivers,
    messages: payload.messages,
  };
}
