const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "5 Oct" — compact race date for calendar cards (UTC, matches the schedule). */
export function formatDayMonth(value: Date): string {
  return dayMonthFormatter.format(value);
}

/** "5 October 2025" — full race date for headings. */
export function formatFullDate(value: Date): string {
  return fullDateFormatter.format(value);
}
