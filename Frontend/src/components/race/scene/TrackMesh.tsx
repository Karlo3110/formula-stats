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
      <mesh geometry={track.surface} receiveShadow={false}>
        <meshStandardMaterial
          color="#11181b"
          roughness={0.85}
          metalness={0.15}
          emissive="#05080a"
        />
      </mesh>

      <Line points={track.leftEdge} color="#27f4d2" lineWidth={2.5} />
      <Line points={track.rightEdge} color="#dfe9ea" lineWidth={1.5} />

      <Line
        points={track.leftEdge}
        color="#27f4d2"
        lineWidth={7}
        transparent
        opacity={0.12}
      />
    </group>
  );
}
