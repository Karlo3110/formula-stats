'use client';

import { useEffect, useState, type JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { readTiming } from '@/lib/race/active-source';

const POLL_MS = 60;
const LIGHT_COUNT = 5;
const GO_DISPLAY_SECONDS = 2.5;

type Phase = { kind: 'countdown'; lit: number } | { kind: 'go' } | { kind: 'hidden' };

function computePhase(): Phase {
  const timing = readTiming();
  if (!timing || timing.lightsOut === null || timing.lightsOut <= 0) {
    return { kind: 'hidden' };
  }
  const { clock, lightsOut } = timing;
  if (clock < lightsOut) {
    const lit = Math.min(
      LIGHT_COUNT,
      Math.ceil((clock / lightsOut) * LIGHT_COUNT),
    );
    return { kind: 'countdown', lit };
  }
  if (clock < lightsOut + GO_DISPLAY_SECONDS) {
    return { kind: 'go' };
  }
  return { kind: 'hidden' };
}

export function StartLights(): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>({ kind: 'hidden' });

  useEffect(() => {
    const id = setInterval(() => setPhase(computePhase()), POLL_MS);
    return () => clearInterval(id);
  }, []);

  if (phase.kind === 'hidden') {
    return null;
  }

  const isGo = phase.kind === 'go';

  return (
    <div role="status" aria-label={isGo ? 'Lights out' : `${phase.kind === 'countdown' ? phase.lit : 0} of ${LIGHT_COUNT} start lights on`}>
      <div className="glass-panel flex items-center gap-2 rounded-xl px-4 py-3">
        {Array.from({ length: LIGHT_COUNT }, (_, index) => {
          const on = !isGo && phase.kind === 'countdown' && index < phase.lit;
          return (
            <span
              key={index}
              className={cn(
                'h-5 w-5 rounded-full border border-white/10 transition-colors duration-150',
                isGo && 'bg-success shadow-[0_0_12px] shadow-success',
                on && 'bg-destructive shadow-[0_0_12px] shadow-destructive',
                !on && !isGo && 'bg-white/10',
              )}
            />
          );
        })}
        {isGo ? (
          <span className="ml-2 font-display text-xl uppercase tracking-widest text-success">
            Go
          </span>
        ) : null}
      </div>
    </div>
  );
}
