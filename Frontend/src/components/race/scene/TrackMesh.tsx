import { useMemo, type JSX } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

import { buildTrackGeometry } from '@/lib/race/track';

interface TrackMeshProps {
  curve: THREE.CatmullRomCurve3;
  width: number;
}

const TEXTURE_SIZE = 128;
const SPECKLES = 1400;

function makeAsphaltTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#34383b';
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  for (let i = 0; i < SPECKLES; i += 1) {
    const shade = 40 + Math.floor(Math.random() * 36);
    ctx.fillStyle = `rgb(${shade},${shade + 2},${shade + 3})`;
    const x = Math.random() * TEXTURE_SIZE;
    const y = Math.random() * TEXTURE_SIZE;
    ctx.fillRect(x, y, 1, Math.random() > 0.5 ? 1 : 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function TrackMesh({ curve, width }: TrackMeshProps): JSX.Element {
  const track = useMemo(() => buildTrackGeometry(curve, width), [curve, width]);
  const asphalt = useMemo(() => makeAsphaltTexture(), []);

  return (
    <group>
      <mesh geometry={track.surface}>
        <meshStandardMaterial
          color="#3a3e41"
          map={asphalt}
          roughness={0.97}
          metalness={0.02}
        />
      </mesh>

      <Line points={track.leftEdge} color="#f4f6f7" lineWidth={2.5} />
      <Line points={track.rightEdge} color="#f4f6f7" lineWidth={2.5} />
    </group>
  );
}
