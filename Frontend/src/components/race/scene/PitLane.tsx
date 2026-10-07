import { useEffect, useMemo, type JSX } from 'react';
import * as THREE from 'three';

import type { Centerline } from '@/lib/race/centerline';
import { buildRibbon, type SpineSample } from '@/lib/race/ribbon';

interface PitLaneProps {
  centerline: Centerline;
  /** Lane paths in replay progress units (see derivePitLane). */
  lanes: ReadonlyArray<ReadonlyArray<SpineSample>>;
  trackWidth: number;
}

const LANE_WIDTH = 0.75;
const LANE_LIFT = -0.008;

/** Pit lane surface, traced from where pitting cars drove. */
export function PitLane({ centerline, lanes, trackWidth }: PitLaneProps): JSX.Element {
  const geometries = useMemo(
    () =>
      lanes.map((lane) =>
        buildRibbon(
          centerline,
          lane.map((sample) => ({ distance: centerline.fromProgress(sample.distance), lateral: sample.lateral })),
          { inner: (-trackWidth * LANE_WIDTH) / 2, outer: (trackWidth * LANE_WIDTH) / 2, lift: LANE_LIFT },
        ),
      ),
    [centerline, lanes, trackWidth],
  );

  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);

  return (
    <group>
      {geometries.map((geometry) => (
        <mesh key={geometry.uuid} geometry={geometry}>
          <meshStandardMaterial color="#3a3d41" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
