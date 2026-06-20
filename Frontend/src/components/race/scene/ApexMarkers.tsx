import { useMemo, type JSX } from 'react';
import type * as THREE from 'three';

import { findApexes } from '@/lib/race/track';

interface ApexMarkersProps {
  curve: THREE.CatmullRomCurve3;
}

export function ApexMarkers({ curve }: ApexMarkersProps): JSX.Element {
  const apexes = useMemo(() => findApexes(curve), [curve]);

  return (
    <group>
      {apexes.map((apex, index) => (
        <mesh
          key={index}
          position={[apex.x, 0.05, apex.z]}
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[1.3, 2.1, 24]} />
          <meshBasicMaterial color="#e8002d" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}
