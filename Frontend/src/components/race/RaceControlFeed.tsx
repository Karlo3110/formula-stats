'use client';

import type { JSX } from 'react';

import { useRaceClock } from '@/hooks/use-race-clock';
import { visibleFeed } from '@/lib/race/messages';
import type { ReplayMessage } from '@/lib/validation/f1-schemas';

const CATEGORY_ACCENT: Record<string, string> = {
  Flag: '#f5c518',
  SafetyCar: '#f5a623',
  Drs: '#2ED3B7',
};

function accentFor(message: ReplayMessage): string {
  if (message.category === 'Flag' && message.flag) {
    const flag = message.flag.toUpperCase();
    if (flag === 'RED') return '#e8002d';
    if (flag.includes('YELLOW')) return '#f5c518';
    if (flag === 'GREEN') return '#52e252';
  }
  return CATEGORY_ACCENT[message.category] ?? '#9fb6b9';
}

export function RaceControlFeed({
  messages,
}: {
  messages: ReadonlyArray<ReplayMessage>;
}): JSX.Element | null {
  const timing = useRaceClock();
  if (!timing || messages.length === 0) {
    return null;
  }

  const feed = visibleFeed(messages, timing.clock);
  if (feed.length === 0) {
    return null;
  }

  return (
    <div className="flex w-72 flex-col gap-2">
      {feed.map((message) => (
        <article
          key={`${message.time}:${message.message}`}
          className="glass-panel animate-overlay-slide-right overflow-hidden rounded-xl"
        >
          <div className="flex items-stretch gap-3">
            <span
              aria-hidden
              className="w-1 shrink-0"
              style={{ backgroundColor: accentFor(message) }}
            />
            <div className="min-w-0 py-2.5 pr-3">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-primary">
                Race Control
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground/90">
                {message.message}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
