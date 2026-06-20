'use client';

import dynamic from 'next/dynamic';
import { useRef, type JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useReplay } from '@/hooks/use-f1';
import { useRaceStore, type CameraMode } from '@/stores/use-race-store';

import { DriverList } from './DriverList';
import { DriverTelemetry } from './DriverTelemetry';
import { StartLights } from './StartLights';

const RACE_SEASON = 2024;
const RACE_ROUND = 1;
const RACE_SESSION = 'R';

const RaceScene = dynamic(
  () => import('./RaceScene').then((mod) => mod.RaceScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
  },
);

const VIGNETTE =
  'radial-gradient(120% 120% at 50% 35%, transparent 50%, rgba(0,0,0,0.55) 100%)';

const CAMERA_MODES: ReadonlyArray<{ mode: CameraMode; label: string }> = [
  { mode: 'cinematic', label: 'Cinematic' },
  { mode: 'orbit', label: 'Free' },
];

function FullscreenIcon({ active }: { active: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      {active ? (
        <path d="M9 9H5m4 0V5m6 4h4m-4 0V5M9 15H5m4 0v4m6-4h4m-4 0v4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4m11-5v4a1 1 0 01-1 1h-4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function RaceView(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const cameraMode = useRaceStore((state) => state.cameraMode);
  const setCameraMode = useRaceStore((state) => state.setCameraMode);

  const replayQuery = useReplay(RACE_SEASON, RACE_ROUND, RACE_SESSION);
  const trackPoints = replayQuery.data?.track ?? null;
  const replayDrivers = replayQuery.data?.drivers ?? null;
  const replayDuration = replayQuery.data?.durationSeconds ?? null;
  const replayLightsOut = replayQuery.data?.lightsOutSeconds ?? null;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-7rem)] min-h-[30rem] overflow-hidden rounded-2xl border border-white/10 bg-[#070a0b]"
    >
      <div className="absolute inset-0">
        <RaceScene
          trackPoints={trackPoints}
          replayDrivers={replayDrivers}
          replayDuration={replayDuration}
          replayLightsOut={replayLightsOut}
        />
      </div>

      <StartLights />

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: VIGNETTE }}
      />

      <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-2">
        <div className="glass-pill flex rounded-full p-1">
          {CAMERA_MODES.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCameraMode(mode)}
              className={cn(
                'rounded-full px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition',
                cameraMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle fullscreen"
          className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:text-primary"
        >
          <FullscreenIcon active={isFullscreen} />
        </button>
      </div>

      <div className="pointer-events-auto absolute bottom-20 left-4 top-4 w-44 animate-overlay-rise md:bottom-4 md:w-56">
        <DriverList />
      </div>

      {selectedDriverId ? (
        <div
          key={selectedDriverId}
          className="pointer-events-auto absolute inset-x-4 bottom-4 animate-overlay-slide-right md:inset-x-auto md:right-4 md:top-16 md:w-64"
        >
          <DriverTelemetry />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
          <span className="glass-pill rounded-full px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted">
            {replayDrivers ? 'Race start replay · tap a car' : 'Loading official data…'}
          </span>
        </div>
      )}
    </div>
  );
}
