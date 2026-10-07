'use client';

import dynamic from 'next/dynamic';
import type { JSX } from 'react';

import type { ReplaySession } from '@/lib/validation/f1-schemas';

import { FlagOverlay } from './FlagOverlay';
import { PlaybackBar } from './PlaybackBar';
import { StageControls } from './StageControls';
import { SessionPill } from './SessionPill';
import { StageNotice } from './StageNotice';
import { StartLights } from './StartLights';
import type { StageNoticeContent } from './stage-notice-content';

const RaceScene = dynamic(() => import('./RaceScene').then((mod) => mod.RaceScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black" />,
});

const VIGNETTE = 'radial-gradient(120% 120% at 50% 40%, transparent 65%, rgba(0,0,0,0.45) 100%)';
const NO_MESSAGES: ReplaySession['messages'] = [];

interface RaceStageProps {
  replay: ReplaySession | null;
  notice: StageNoticeContent | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

/** The 3D replay with its in-scene overlays and transport controls. */
export function RaceStage({ replay, notice, isFullscreen, onToggleFullscreen }: RaceStageProps): JSX.Element {
  const messages = replay?.messages ?? NO_MESSAGES;

  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden rounded-xl border border-white/[0.08] bg-black">
      <div className="absolute inset-0">
        <RaceScene replay={replay} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: VIGNETTE }} />

      {replay ? (
        <div className="pointer-events-none absolute left-3 top-3 z-20 hidden sm:block">
          <SessionPill sessionName={replay.sessionName} />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-14 z-20 flex flex-col items-center gap-2 sm:top-3">
        <StartLights />
        <FlagOverlay messages={messages} />
      </div>

      <div className="absolute right-3 top-3 z-20">
        <StageControls isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />
      </div>

      {replay ? (
        <div className="absolute inset-x-3 bottom-3 z-20">
          <PlaybackBar messages={messages} />
        </div>
      ) : null}

      {notice ? <StageNotice {...notice} /> : null}
    </div>
  );
}
