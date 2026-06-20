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

      <Line points={track.leftEdge} color="#27f4d2" lineWidth={5} />
      <Line points={track.rightEdge} color="#eef5f6" lineWidth={4} />

      <Line
        points={track.leftEdge}
        color="#27f4d2"
        lineWidth={16}
        transparent
        opacity={0.14}
      />
      <Line
        points={track.rightEdge}
        color="#9fb6b9"
        lineWidth={12}
        transparent
        opacity={0.08}
      />
    </group>
  );
}
