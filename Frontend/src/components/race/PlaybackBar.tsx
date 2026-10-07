'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { useReplayPlayback } from '@/hooks/use-replay-playback';
import { PLAYBACK_RATES, formatRaceClock } from '@/lib/race/playback';
import type { ReplayMessage } from '@/lib/validation/f1-schemas';

import { PlayPauseIcon } from './PlaybackIcons';
import { ReplayTimeline } from './ReplayTimeline';

const SCRUB_STEP_SECONDS = 1;

interface PlaybackBarProps {
  messages: ReadonlyArray<ReplayMessage>;
}

/** Transport controls for the replay: play/pause, timeline scrubber, speed. */
export function PlaybackBar({ messages }: PlaybackBarProps): JSX.Element | null {
  const { timing, isPlaying, rate, togglePlay, seek, setRate } = useReplayPlayback();
  if (!timing) {
    return null;
  }

  const { clock, lightsOut, durationSeconds } = timing;
  const origin = lightsOut ?? 0;

  return (
    <div className="glass-panel flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-2.5 sm:flex-nowrap">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-heading text-background transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PlayPauseIcon isPlaying={isPlaying} />
      </button>

      <span className="w-[8.5rem] shrink-0 font-mono text-xs tabular-nums text-foreground">
        {formatRaceClock(clock, origin)}
        <span className="text-muted"> / {formatRaceClock(durationSeconds, origin)}</span>
      </span>

      <ReplayTimeline
        clock={clock}
        duration={durationSeconds}
        lightsOut={lightsOut}
        messages={messages}
        step={SCRUB_STEP_SECONDS}
        onSeek={seek}
        className="order-last basis-full sm:order-none sm:basis-auto"
      />

      <div role="group" aria-label="Playback speed" className="ml-auto flex shrink-0 rounded-full border border-white/10 p-0.5 sm:ml-0">
        {PLAYBACK_RATES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRate(option)}
            aria-pressed={rate === option}
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[0.65rem] tabular-nums transition',
              rate === option ? 'bg-white/15 text-heading' : 'text-muted hover:text-foreground',
            )}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  );
}
