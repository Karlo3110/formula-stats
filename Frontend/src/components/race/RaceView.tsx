'use client';

import { useEffect, useRef, type JSX } from 'react';

import { SessionCode } from '@/lib/f1/race-archive';
import { getApiErrorCode } from '@/lib/utils/api-error';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useReplay } from '@/hooks/use-f1';
import { useRaceTarget, type RaceRequest } from '@/hooks/use-race-target';
import { useSeasonDrivers } from '@/hooks/use-season-drivers';
import { useRaceStore } from '@/stores/use-race-store';

import { DriverFocusPanel } from './DriverFocusPanel';
import { RaceControlLog } from './RaceControlLog';
import { RaceHeader } from './RaceHeader';
import { RaceStage } from './RaceStage';
import { TimingTower } from './TimingTower';
import { TrackMap } from './TrackMap';
import { stageNoticeFor, type ReplayStatus } from './stage-notice-content';

const NOT_PUBLISHED = 'F1_DATA_NOT_FOUND';

function replayStatusOf(query: ReturnType<typeof useReplay>, hasTarget: boolean): ReplayStatus {
  if (!hasTarget) return 'idle';
  if (query.isError) return getApiErrorCode(query.error) === NOT_PUBLISHED ? 'unpublished' : 'failed';
  if (query.isLoading) return 'loading';
  return query.data ? 'ready' : 'idle';
}

/**
 * Race center: header, timing tower, 3D stage with playback, and a telemetry
 * rail (track map, followed driver, race control). Everything goes fullscreen.
 */
export function RaceView(request: RaceRequest): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(containerRef);
  const resetForNewRace = useRaceStore((state) => state.resetForNewRace);
  const resolved = useRaceTarget(request);
  const { target } = resolved;
  const drivers = useSeasonDrivers(target?.season ?? null);

  const replayQuery = useReplay(target?.season ?? 0, target?.round ?? 0, target?.session ?? SessionCode.Race, {
    enabled: target !== null,
  });
  const replayStatus = replayStatusOf(replayQuery, target !== null);
  const replay = replayStatus === 'ready' ? (replayQuery.data ?? null) : null;
  const isReady = replay !== null && replay.drivers.length > 0;
  const targetKey = target ? `${target.season}:${target.round}:${target.session}` : null;

  useEffect(() => {
    resetForNewRace();
  }, [targetKey, resetForNewRace]);

  const notice = stageNoticeFor({
    blocker: resolved.blocker,
    isResolving: resolved.isResolving,
    replayStatus,
    isExplicit: resolved.isExplicit,
    season: request.season ?? target?.season ?? null,
    round: request.round ?? target?.round ?? null,
    onRetry: () => void replayQuery.refetch(),
  });

  return (
    <div ref={containerRef} className="mx-auto flex max-w-[110rem] flex-col gap-4 bg-background lg:h-[calc(100dvh-7rem)] lg:min-h-[42rem]">
      <RaceHeader
        season={target?.season ?? null}
        event={resolved.event}
        sessions={resolved.sessions}
        activeSession={target?.session ?? request.session}
      />
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[14rem_minmax(0,1fr)_19rem] lg:grid-rows-[minmax(0,1fr)]">
        <div className="order-2 h-[26rem] min-h-0 lg:order-none lg:h-auto">
          <TimingTower isReady={isReady} />
        </div>
        <div className="order-1 h-[62vh] min-h-0 lg:order-none lg:h-auto">
          <RaceStage replay={replay} notice={notice} isFullscreen={isFullscreen} onToggleFullscreen={toggle} />
        </div>
        <aside className="order-3 grid min-h-0 gap-3 sm:grid-cols-2 lg:order-none lg:grid-cols-1 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
          <TrackMap outline={replay?.track ?? null} />
          <DriverFocusPanel isReady={isReady} drivers={drivers} />
          <div className="h-72 min-h-0 sm:col-span-2 lg:col-span-1 lg:h-auto">
            <RaceControlLog messages={replay?.messages ?? []} />
          </div>
        </aside>
      </div>
    </div>
  );
}
