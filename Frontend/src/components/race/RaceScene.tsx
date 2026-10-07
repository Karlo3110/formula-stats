'use client';

import { useEffect, useMemo, type JSX } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { setActiveSource } from '@/lib/race/active-source';
import { Centerline } from '@/lib/race/centerline';
import { findCorners } from '@/lib/race/corners';
import { DEFAULT_TRACK_WIDTH, createDefaultCenterline } from '@/lib/race/default-track';
import { MockSource } from '@/lib/race/mock-source';
import { derivePitLane } from '@/lib/race/pit-lane';
import { ReplaySource } from '@/lib/race/replay-source';
import { toScenePoint } from '@/lib/race/scene-coords';
import type { RaceSource } from '@/lib/race/types';
import type { ReplaySession } from '@/lib/validation/f1-schemas';
import { useRaceStore } from '@/stores/use-race-store';

import { CarsLayer } from './scene/CarsLayer';
import { Kerbs } from './scene/Kerbs';
import { PitLane } from './scene/PitLane';
import { RigCamera } from './scene/RigCamera';
import { SceneEnvironment } from './scene/SceneEnvironment';
import { StartLine } from './scene/StartLine';
import { Ticker } from './scene/Ticker';
import { TrackSurface } from './scene/TrackSurface';

const MIN_TRACK_POINTS = 8;
const INITIAL_CAMERA = { position: [0, 190, 260] as [number, number, number], fov: 38, near: 0.05, far: 3000 };
const ORBIT_TARGET: [number, number, number] = [0, 0, 0];

function centerlineOf(replay: ReplaySession | null): Centerline {
  return replay && replay.track.length >= MIN_TRACK_POINTS
    ? new Centerline(replay.track.map(toScenePoint), replay.lapLength)
    : createDefaultCenterline();
}

function sourceOf(replay: ReplaySession | null, centerline: Centerline): RaceSource {
  return replay && replay.drivers.length > 0 ? new ReplaySource(replay, centerline) : new MockSource(centerline);
}

/** The 3D circuit with every car, driven by the replay (or a stand-in race). */
export function RaceScene({ replay }: { replay: ReplaySession | null }): JSX.Element {
  const centerline = useMemo(() => centerlineOf(replay), [replay]);
  const trackWidth = replay?.trackWidth ?? DEFAULT_TRACK_WIDTH;
  const source = useMemo(() => sourceOf(replay, centerline), [replay, centerline]);
  const corners = useMemo(() => findCorners(centerline, trackWidth), [centerline, trackWidth]);
  const pitLanes = useMemo(
    () => (replay ? derivePitLane(replay.drivers, replay.lapLength, trackWidth) : []),
    [replay, trackWidth],
  );
  const clearSelection = useRaceStore((state) => state.clearSelection);
  const cameraMode = useRaceStore((state) => state.cameraMode);

  useEffect(() => {
    setActiveSource(source);
    return () => setActiveSource(null);
  }, [source]);

  return (
    <Canvas
      camera={INITIAL_CAMERA}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
      onPointerMissed={() => clearSelection()}
    >
      <SceneEnvironment centerline={centerline} />
      <Ticker source={source} />
      <TrackSurface centerline={centerline} trackWidth={trackWidth} />
      <PitLane centerline={centerline} lanes={pitLanes} trackWidth={trackWidth} />
      <Kerbs centerline={centerline} corners={corners} trackWidth={trackWidth} />
      <StartLine centerline={centerline} trackWidth={trackWidth} />
      <CarsLayer source={source} trackWidth={trackWidth} />

      {cameraMode === 'orbit' ? (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={trackWidth * 2}
          maxDistance={700}
          maxPolarAngle={Math.PI * 0.47}
          target={ORBIT_TARGET}
        />
      ) : (
        <RigCamera source={source} centerline={centerline} corners={corners} trackWidth={trackWidth} mode={cameraMode} />
      )}
    </Canvas>
  );
}
