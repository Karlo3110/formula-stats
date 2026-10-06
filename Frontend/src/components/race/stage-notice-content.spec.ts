import { describe, expect, it, vi } from 'vitest';

import { stageNoticeFor, type StageNoticeInput } from './stage-notice-content';

function createInput(overrides: Partial<StageNoticeInput> = {}): StageNoticeInput {
  return {
    blocker: null,
    isResolving: false,
    replayStatus: 'ready',
    isExplicit: false,
    season: 2026,
    round: 18,
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe('stageNoticeFor', () => {
  it('shows nothing once the replay is ready', () => {
    expect(stageNoticeFor(createInput())).toBeNull();
  });

  it('shows a loading notice while the race is being resolved', () => {
    expect(stageNoticeFor(createInput({ isResolving: true, replayStatus: 'idle' }))?.isLoading).toBe(true);
  });

  it('explains unpublished telemetry and links to the archive', () => {
    const notice = stageNoticeFor(createInput({ replayStatus: 'unpublished' }));

    expect(notice?.actions.map((action) => action.href)).toEqual(['/history']);
  });

  it('offers a retry that calls back when the replay failed', () => {
    const onRetry = vi.fn();
    const notice = stageNoticeFor(createInput({ replayStatus: 'failed', onRetry }));

    notice?.actions[0]?.onClick?.();

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('names the missing round when the URL points at an unknown race', () => {
    const notice = stageNoticeFor(createInput({ blocker: 'unknown-round', round: 99, isExplicit: true }));

    expect(notice?.body).toBe('Round 99 is not on the 2026 calendar.');
  });

  it('offers the latest race as a way out of an explicit dead end', () => {
    const notice = stageNoticeFor(createInput({ blocker: 'not-run-yet', isExplicit: true }));

    expect(notice?.actions.map((action) => action.href)).toEqual(['/race', '/history']);
  });

  it('prefers a blocker over a loading state', () => {
    const notice = stageNoticeFor(createInput({ blocker: 'no-finished-race', replayStatus: 'loading' }));

    expect(notice?.title).toBe('No finished race yet');
  });
});
