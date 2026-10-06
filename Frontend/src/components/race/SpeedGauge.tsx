import type { JSX } from 'react';

const MAX_SPEED_KMH = 360;
const RADIUS = 52;
const STROKE = 7;
const ARC_LENGTH = Math.PI * RADIUS;
const VIEW_WIDTH = (RADIUS + STROKE) * 2;
const VIEW_HEIGHT = RADIUS + STROKE * 2;
const ARC_PATH = `M ${STROKE} ${RADIUS + STROKE} A ${RADIUS} ${RADIUS} 0 0 1 ${VIEW_WIDTH - STROKE} ${RADIUS + STROKE}`;

function speedFraction(speedKmh: number): number {
  return Math.min(1, Math.max(0, speedKmh / MAX_SPEED_KMH));
}

/** Semicircular speedometer (0–360 km/h) with the live value in the centre. */
export function SpeedGauge({ speedKmh }: { speedKmh: number }): JSX.Element {
  const filled = ARC_LENGTH * speedFraction(speedKmh);

  return (
    <div className="relative mx-auto w-full max-w-[10.5rem]">
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="w-full" role="img" aria-label={`${speedKmh} km/h`}>
        <path d={ARC_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} strokeLinecap="round" />
        <path
          d={ARC_PATH}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${ARC_LENGTH}`}
          className="transition-[stroke-dasharray] duration-200 ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="font-display text-4xl leading-none tabular-nums text-heading">{speedKmh}</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">km/h</span>
      </div>
    </div>
  );
}
