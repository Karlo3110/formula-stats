import type { RaceBlocker } from '@/hooks/use-race-target';

import type { StageNoticeAction } from './StageNotice';

export type ReplayStatus = 'idle' | 'loading' | 'ready' | 'unpublished' | 'failed';

export interface StageNoticeInput {
  blocker: RaceBlocker | null;
  isResolving: boolean;
  replayStatus: ReplayStatus;
  isExplicit: boolean;
  season: number | null;
  round: number | null;
  onRetry: () => void;
}

export interface StageNoticeContent {
  title: string;
  body: string;
  isLoading: boolean;
  actions: StageNoticeAction[];
}

const ARCHIVE_ACTION: StageNoticeAction = { label: 'Browse race archive', href: '/history' };
const LATEST_ACTION: StageNoticeAction = { label: 'Watch latest race', href: '/race' };

function blockerNotice(input: StageNoticeInput, blocker: RaceBlocker): StageNoticeContent {
  const fallback = input.isExplicit ? [LATEST_ACTION, ARCHIVE_ACTION] : [ARCHIVE_ACTION];
  switch (blocker) {
    case 'no-finished-race':
      return { title: 'No finished race yet', body: 'Once a Grand Prix has been run, its replay appears here.', isLoading: false, actions: [ARCHIVE_ACTION] };
    case 'unknown-round':
      return { title: 'Race not found', body: `Round ${input.round ?? '?'} is not on the ${input.season ?? ''} calendar.`, isLoading: false, actions: fallback };
    case 'not-run-yet':
      return { title: 'Not run yet', body: 'Replays become available once a session of this weekend has finished.', isLoading: false, actions: fallback };
  }
}

/** Which full-stage message (if any) to show over the 3D scene. */
export function stageNoticeFor(input: StageNoticeInput): StageNoticeContent | null {
  if (input.blocker) return blockerNotice(input, input.blocker);
  if (input.isResolving || input.replayStatus === 'loading' || input.replayStatus === 'idle') {
    return {
      title: 'Loading telemetry',
      body: 'Fetching official timing and position data. The first load of a session can take a couple of minutes while every lap is processed.',
      isLoading: true,
      actions: [],
    };
  }
  if (input.replayStatus === 'unpublished') {
    return {
      title: 'Replay not published yet',
      body: 'Position data for this session has not been released. It usually appears a few hours after the chequered flag.',
      isLoading: false,
      actions: [ARCHIVE_ACTION],
    };
  }
  if (input.replayStatus === 'failed') {
    return {
      title: 'Replay failed to load',
      body: 'The data service did not respond. Try again in a moment.',
      isLoading: false,
      actions: [{ label: 'Try again', onClick: input.onRetry }, ARCHIVE_ACTION],
    };
  }
  return null;
}
