import { useEffect, useMemo, type JSX } from 'react';
import * as THREE from 'three';

import type { Centerline } from '@/lib/race/centerline';
import { buildRibbon, loopSpine } from '@/lib/race/ribbon';
import { groundHeight } from '@/lib/race/scene-coords';

import { GRASS_TINT } from './SceneEnvironment';
import { createAsphaltTexture, createGrassTexture } from './scene-textures';

interface TrackSurfaceProps {
  centerline: Centerline;
  trackWidth: number;
}

// Widths in track widths; lifts in world units so each layer sits on the one below.
const VERGE = 3.2;
const RUN_OFF = 0.6;
const EDGE_LINE = 0.06;
const LIFT = { verge: -0.03, runOff: -0.015, road: 0, line: 0.004 } as const;
const ASPHALT_TEXTURE_LENGTH = 2;
const GRASS_TEXTURE_LENGTH = 20;

interface SurfaceLayers {
  leftVerge: THREE.BufferGeometry;
  rightVerge: THREE.BufferGeometry;
  runOff: THREE.BufferGeometry;
  road: THREE.BufferGeometry;
  leftLine: THREE.BufferGeometry;
  rightLine: THREE.BufferGeometry;
}

function buildLayers(centerline: Centerline, trackWidth: number): SurfaceLayers {
  const spine = loopSpine(centerline);
  const half = trackWidth / 2;
  const band = (edge: number, lift: number): THREE.BufferGeometry =>
    buildRibbon(centerline, spine, { inner: -edge, outer: edge, lift });
  // Grass embankments slope from the run-off down to the ground plane, so a
  // circuit with real elevation never floats above the grass.
  const verge = (side: 1 | -1): THREE.BufferGeometry =>
    buildRibbon(centerline, spine, {
      inner: side * (half + trackWidth * RUN_OFF),
      outer: side * (half + trackWidth * VERGE),
      lift: LIFT.verge,
      outerHeight: groundHeight(centerline.points),
      textureLength: GRASS_TEXTURE_LENGTH,
    });
  return {
    leftVerge: verge(1),
    rightVerge: verge(-1),
    runOff: band(half + trackWidth * RUN_OFF, LIFT.runOff),
    road: buildRibbon(centerline, spine, {
      inner: -half,
      outer: half,
      lift: LIFT.road,
      textureLength: trackWidth * ASPHALT_TEXTURE_LENGTH,
    }),
    leftLine: buildRibbon(centerline, spine, { inner: half - trackWidth * EDGE_LINE, outer: half, lift: LIFT.line }),
    rightLine: buildRibbon(centerline, spine, { inner: -half, outer: -half + trackWidth * EDGE_LINE, lift: LIFT.line }),
  };
}

/** Tarmac, white edge lines, run-off and grass embankments draped over the circuit. */
export function TrackSurface({ centerline, trackWidth }: TrackSurfaceProps): JSX.Element {
  const layers = useMemo(() => buildLayers(centerline, trackWidth), [centerline, trackWidth]);
  const asphalt = useMemo(() => createAsphaltTexture(), []);
  const grass = useMemo(() => createGrassTexture(), []);

  useEffect(() => () => Object.values(layers).forEach((geometry) => geometry.dispose()), [layers]);

  return (
    <group>
      {[layers.leftVerge, layers.rightVerge].map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry}>
          <meshStandardMaterial color={GRASS_TINT} map={grass} roughness={1} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={layers.runOff}>
        <meshStandardMaterial color="#4d5257" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={layers.road}>
        <meshStandardMaterial color="#c4c8cc" map={asphalt} roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      {[layers.leftLine, layers.rightLine].map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry}>
          <meshStandardMaterial color="#f2f2f0" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
