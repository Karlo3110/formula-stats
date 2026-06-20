import { useMemo, type JSX } from 'react';
import { Line } from '@react-three/drei';
import type * as THREE from 'three';

import { buildTrackGeometry } from '@/lib/race/track';

interface TrackMeshProps {
  curve: THREE.CatmullRomCurve3;
}

export function TrackMesh({ curve }: TrackMeshProps): JSX.Element {
  const track = useMemo(() => buildTrackGeometry(curve), [curve]);

  return (
    <group>
      <mesh geometry={track.surface}>
        <meshStandardMaterial color="#2b2e30" roughness={0.95} metalness={0.05} />
      </mesh>

      <Line points={track.leftEdge} color="#f4f6f7" lineWidth={2.5} />
      <Line points={track.rightEdge} color="#f4f6f7" lineWidth={2.5} />
    </group>
  );
}
