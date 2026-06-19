import type { JSX } from 'react';

import { CIRCUIT_PATH, CIRCUIT_VIEWBOX } from '@/lib/circuit-path';
import type { TrackCar } from '@/lib/mock/telemetry';

const TRACK_PATH_ID = 'track-path';

interface TrackViewProps {
  circuit: string;
  cars: TrackCar[];
}

function Car({ car }: { car: TrackCar }): JSX.Element {
  const beginOffset = `-${(car.startOffset * car.lapSeconds).toFixed(2)}s`;
  return (
    <g>
      <circle r={5} fill={car.color} stroke="var(--color-background)" strokeWidth={1.5} />
      <text
        x={0}
        y={2.5}
        textAnchor="middle"
        className="fill-background"
        style={{ fontSize: '5px', fontWeight: 700 }}
      >
        {car.label}
      </text>
      <animateMotion
        dur={`${car.lapSeconds}s`}
        begin={beginOffset}
        repeatCount="indefinite"
        rotate="0"
      >
        <mpath href={`#${TRACK_PATH_ID}`} />
      </animateMotion>
    </g>
  );
}

export function TrackView({ circuit, cars }: TrackViewProps): JSX.Element {
  return (
    <div className="relative flex h-full min-h-[24rem] flex-col overflow-hidden rounded-lg border border-border/70 bg-gradient-to-b from-surface/40 to-background/60">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Live Track · {circuit}
          </h2>
        </div>
        <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-primary">
          3D view coming soon
        </span>
      </div>

      <svg
        viewBox={CIRCUIT_VIEWBOX}
        className="flex-1 px-6 pb-6"
        fill="none"
        aria-label={`Live car positions on the ${circuit} circuit`}
      >
        <defs>
          <path id={TRACK_PATH_ID} d={CIRCUIT_PATH} />
          <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <use href={`#${TRACK_PATH_ID}`} stroke="var(--color-border)" strokeWidth={9} strokeLinejoin="round" />
        <use
          href={`#${TRACK_PATH_ID}`}
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          strokeOpacity={0.5}
          filter="url(#track-glow)"
        />

        {cars.map((car) => (
          <Car key={car.id} car={car} />
        ))}
      </svg>
    </div>
  );
}
