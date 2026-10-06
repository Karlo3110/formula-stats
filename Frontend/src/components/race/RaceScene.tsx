'use client';

import { useEffect, useMemo, type JSX } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';

import { setActiveSource } from '@/lib/race/active-source';
import { MockSource } from '@/lib/race/mock-source';
import { ReplaySource } from '@/lib/race/replay-source';
import { createTrackCurve, curveFromPoints } from '@/lib/race/track';
import type { RaceSource } from '@/lib/race/types';
import type { ReplayDriver } from '@/lib/validation/f1-schemas';
import { useRaceStore } from '@/stores/use-race-store';

import { CarsLayer } from './scene/CarsLayer';
import { RigCamera } from './scene/RigCamera';
import { Ticker } from './scene/Ticker';
import { TrackMesh } from './scene/TrackMesh';

const SCENE_BACKGROUND = '#060607';
// Just under the lowest track point (elevation datum is 0) to avoid z-fighting.
const GROUND_OFFSET = -0.15;

interface RaceSceneProps {
  trackPoints: ReadonlyArray<ReadonlyArray<number>> | null;
  replayDrivers: ReplayDriver[] | null;
  replayDuration: number | null;
  replayLightsOut: number | null;
  trackWidth: number;
  carScale: number;
}

export function RaceScene({
  trackPoints,
  replayDrivers,
  replayDuration,
  replayLightsOut,
  trackWidth,
  carScale,
}: RaceSceneProps): JSX.Element {
  const curve = useMemo(
    () => (trackPoints ? curveFromPoints(trackPoints) : createTrackCurve()),
    [trackPoints],
  );

  const source = useMemo<RaceSource>(
    () =>
      replayDrivers && replayDrivers.length > 0
        ? new ReplaySource(replayDrivers, replayDuration ?? 1, replayLightsOut ?? 0)
        : new MockSource(curve),
    [replayDrivers, replayDuration, replayLightsOut, curve],
  );

  useEffect(() => {
    setActiveSource(source);
    return () => setActiveSource(null);
  }, [source]);

  const clearSelection = useRaceStore((state) => state.clearSelection);
  const cameraMode = useRaceStore((state) => state.cameraMode);

  return (
    <Canvas
      camera={{ position: [0, 155, 235], fov: 38, near: 0.1, far: 1400 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={[SCENE_BACKGROUND]} />
      <fog attach="fog" args={[SCENE_BACKGROUND, 340, 1200]} />
      <Grid
        position={[0, GROUND_OFFSET, 0]}
        infiniteGrid
        cellSize={10}
        sectionSize={50}
        cellThickness={0.6}
        sectionThickness={1}
        cellColor="#18181b"
        sectionColor="#26262b"
        fadeDistance={700}
        fadeStrength={1.5}
      />

      <ambientLight intensity={0.85} />
      <directionalLight position={[60, 120, 40]} intensity={1.3} />
      <hemisphereLight args={['#3a3f42', '#000000', 0.5]} />

      <Ticker source={source} />
      <TrackMesh curve={curve} width={trackWidth} />
      <CarsLayer source={source} carScale={carScale} />

      {cameraMode === 'orbit' ? (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={25}
          maxDistance={520}
          maxPolarAngle={Math.PI * 0.49}
          target={[0, 0, 0]}
        />
      ) : (
        <RigCamera source={source} curve={curve} trackWidth={trackWidth} />
      )}
    </Canvas>
  );
}
