'use client';

import { useMemo, type ChangeEvent, type JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { timelineMarkers } from '@/lib/race/message-tone';
import type { ReplayMessage } from '@/lib/validation/f1-schemas';

interface ReplayTimelineProps {
  clock: number;
  duration: number;
  lightsOut: number | null;
  messages: ReadonlyArray<ReplayMessage>;
  step: number;
  onSeek: (seconds: number) => void;
  className?: string;
}

function toPercent(seconds: number, duration: number): number {
  return duration > 0 ? Math.min(100, (seconds / duration) * 100) : 0;
}

/** Scrubber track with progress, the lights-out tick and hazard markers. */
export function ReplayTimeline({
  clock,
  duration,
  lightsOut,
  messages,
  step,
  onSeek,
  className,
}: ReplayTimelineProps): JSX.Element {
  const markers = useMemo(() => timelineMarkers(messages, duration), [messages, duration]);
  const progress = toPercent(clock, duration);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onSeek(Number(event.target.value));
  }

  return (
    <div className={cn('relative flex h-6 min-w-0 flex-1 items-center', className)}>
      <div aria-hidden className="absolute inset-x-0 h-1 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        {lightsOut !== null && lightsOut > 0 ? (
          <span className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/60" style={{ left: `${toPercent(lightsOut, duration)}%` }} />
        ) : null}
        {markers.map((marker) => (
          <span
            key={marker.key}
            title={marker.label}
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background"
            style={{ left: `${marker.percent}%`, backgroundColor: marker.color }}
          />
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={duration}
        step={step}
        value={clock}
        onChange={handleChange}
        aria-label="Replay position"
        aria-valuetext={`${Math.round(clock)} of ${Math.round(duration)} seconds`}
        className="scrubber relative h-6 w-full"
      />
    </div>
  );
}
