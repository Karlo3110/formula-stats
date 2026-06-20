'use client';

import { useEffect, useMemo, type JSX } from 'react';
import { Canvas } from '@react-three/fiber';

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

interface RaceSceneProps {
  trackPoints: ReadonlyArray<readonly [number, number]> | null;
  replayDrivers: ReplayDriver[] | null;
  replayDuration: number | null;
  replayLightsOut: number | null;
}

export function RaceScene({
  trackPoints,
  replayDrivers,
  replayDuration,
  replayLightsOut,
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

  return (
    <Canvas
      camera={{ position: [0, 155, 235], fov: 38, near: 0.1, far: 1200 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={['#070a0b']} />
      <fog attach="fog" args={['#070a0b', 300, 1050]} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[40, 80, 20]} intensity={1.2} />
      <hemisphereLight args={['#1a2a2e', '#05070a', 0.4]} />

      <mesh rotation-x={-Math.PI / 2} position-y={-0.06}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#05070a" roughness={1} />
      </mesh>

      <Ticker source={source} />
      <TrackMesh curve={curve} />
      <CarsLayer source={source} />
      <RigCamera source={source} />
    </Canvas>
  );
}
