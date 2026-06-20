import type { WeekendEvent, WeekendSchedule } from '@/lib/validation/f1-schemas';

export type SessionStatus = 'done' | 'live' | 'upcoming';

const SESSION_WINDOW_MS = 2 * 60 * 60 * 1000;

export interface UpcomingSession {
  event: WeekendEvent;
  sessionName: string;
  start: Date;
}

function sessionStarts(event: WeekendEvent): { name: string; start: Date }[] {
  return event.sessions
    .filter((s) => s.startUtc)
    .map((s) => ({ name: s.name, start: new Date(s.startUtc as string) }));
}

/** The next session (across all events) starting strictly after `now`. */
export function findNextSession(
  schedule: WeekendSchedule,
  now: Date,
): UpcomingSession | null {
  let best: UpcomingSession | null = null;
  for (const event of schedule.events) {
    for (const { name, start } of sessionStarts(event)) {
      if (start.getTime() > now.getTime()) {
        if (!best || start.getTime() < best.start.getTime()) {
          best = { event, sessionName: name, start };
        }
      }
    }
  }
  return best;
}

/** The event to feature: the one with the next session, else the final event. */
export function findFeaturedEvent(
  schedule: WeekendSchedule,
  now: Date,
): WeekendEvent | null {
  const next = findNextSession(schedule, now);
  if (next) {
    return next.event;
  }
  return schedule.events[schedule.events.length - 1] ?? null;
}

export function sessionStatus(start: Date, now: Date): SessionStatus {
  const diff = now.getTime() - start.getTime();
  if (diff < 0) return 'upcoming';
  if (diff < SESSION_WINDOW_MS) return 'live';
  return 'done';
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatSessionTime(start: Date): string {
  return dateFormatter.format(start);
}
