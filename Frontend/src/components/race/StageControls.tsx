'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';
import { useRaceStore, type CameraMode } from '@/stores/use-race-store';

const CAMERA_MODES: ReadonlyArray<{ mode: CameraMode; label: string }> = [
  { mode: 'cinematic', label: 'TV cam' },
  { mode: 'orbit', label: 'Free' },
];

interface StageControlsProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function FullscreenIcon({ isActive }: { isActive: boolean }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      {isActive ? (
        <path d="M9 9H5m4 0V5m6 4h4m-4 0V5M9 15H5m4 0v4m6-4h4m-4 0v4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4m11-5v4a1 1 0 01-1 1h-4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/** Camera mode switch and fullscreen toggle, top-right of the stage. */
export function StageControls({ isFullscreen, onToggleFullscreen }: StageControlsProps): JSX.Element {
  const cameraMode = useRaceStore((state) => state.cameraMode);
  const setCameraMode = useRaceStore((state) => state.setCameraMode);

  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="Camera" className="glass-pill flex rounded-full p-0.5">
        {CAMERA_MODES.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setCameraMode(mode)}
            aria-pressed={cameraMode === mode}
            className={cn(
              'rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition',
              cameraMode === mode ? 'bg-white/15 text-heading' : 'text-muted hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        className="glass-pill flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:text-heading"
      >
        <FullscreenIcon isActive={isFullscreen} />
      </button>
    </div>
  );
}
