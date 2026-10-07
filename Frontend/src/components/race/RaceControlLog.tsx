'use client';

import type { JSX } from 'react';

import { Panel } from '@/components/ui/Panel';
import { useRaceClock } from '@/hooks/use-race-clock';
import { TONE_COLORS, messageTone } from '@/lib/race/message-tone';
import { formatRaceClock } from '@/lib/race/playback';
import { messagesUpTo } from '@/lib/race/race-log';
import type { ReplayMessage } from '@/lib/validation/f1-schemas';

interface RaceControlLogProps {
  messages: ReadonlyArray<ReplayMessage>;
}

function LogRow({ message, origin }: { message: ReplayMessage; origin: number }): JSX.Element {
  return (
    <li className="animate-overlay-rise grid grid-cols-[3.25rem_0.5rem_1fr] items-baseline gap-2 border-b border-white/[0.05] px-4 py-2.5 last:border-b-0">
      <span className="font-mono text-[0.7rem] tabular-nums text-muted">
        {formatRaceClock(message.time, origin)}
      </span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 translate-y-[-1px] rounded-full"
        style={{ backgroundColor: TONE_COLORS[messageTone(message)] }}
      />
      <span className="font-mono text-[0.7rem] uppercase leading-snug text-foreground/85">
        {message.message}
      </span>
    </li>
  );
}

/** Race-control messages as issued, synced to the replay clock. */
export function RaceControlLog({ messages }: RaceControlLogProps): JSX.Element {
  const timing = useRaceClock();
  const log = timing ? messagesUpTo(messages, timing.clock) : [];

  return (
    <Panel className="h-full" title="Race control" aside={<span className="font-mono text-[0.65rem] text-muted">{log.length}</span>}>
      {log.length > 0 && timing ? (
        <ol aria-live="polite" className="h-full overflow-y-auto">
          {log.map((message) => (
            <LogRow key={`${message.time}:${message.message}`} message={message} origin={timing.lightsOut ?? 0} />
          ))}
        </ol>
      ) : (
        <p className="px-4 py-4 text-sm text-muted">Messages appear here as race control issues them.</p>
      )}
    </Panel>
  );
}
