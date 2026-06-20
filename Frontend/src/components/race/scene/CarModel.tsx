import type { JSX } from 'react';
import * as THREE from 'three';

interface CarModelProps {
  color: string;
  selected: boolean;
  scale: number;
}

const WHEEL = [
  [0.56, 0.95] as const,
  [-0.56, 0.95] as const,
  [0.58, -0.95] as const,
  [-0.58, -0.95] as const,
];

/** Neon low-poly F1 car (forward = +Z): glowing bodywork + round wheels. */
export function CarModel({ color, selected, scale }: CarModelProps): JSX.Element {
  const finalScale = selected ? scale * 1.3 : scale;
  const glow = selected ? 1.9 : 1.15;

  return (
    <group scale={finalScale}>
      {/* underglow */}
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.5, 28]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.4 : 0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* monocoque */}
      <mesh position={[0, 0.3, -0.1]}>
        <boxGeometry args={[0.66, 0.26, 2.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          toneMapped={false}
          metalness={0.3}
          roughness={0.35}
        />
      </mesh>

      {/* nose */}
      <mesh position={[0, 0.27, 1.35]}>
        <boxGeometry args={[0.28, 0.16, 1.0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow * 0.8}
          toneMapped={false}
          roughness={0.45}
        />
      </mesh>

      {/* front wing */}
      <mesh position={[0, 0.14, 1.95]}>
        <boxGeometry args={[1.5, 0.05, 0.42]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          toneMapped={false}
          roughness={0.4}
        />
      </mesh>
      {[-0.74, 0.74].map((x) => (
        <mesh key={x} position={[x, 0.2, 1.95]}>
          <boxGeometry args={[0.05, 0.2, 0.42]} />
          <meshStandardMaterial color="#0b0e12" roughness={0.6} />
        </mesh>
      ))}

      {/* halo / cockpit */}
      <mesh position={[0, 0.5, 0.05]}>
        <boxGeometry args={[0.4, 0.26, 0.6]} />
        <meshStandardMaterial color="#0b0e12" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* rear wing */}
      <mesh position={[0, 0.56, -1.35]}>
        <boxGeometry args={[1.18, 0.34, 0.09]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          toneMapped={false}
          roughness={0.4}
        />
      </mesh>
      {[-0.58, 0.58].map((x) => (
        <mesh key={x} position={[x, 0.5, -1.32]}>
          <boxGeometry args={[0.06, 0.36, 0.34]} />
          <meshStandardMaterial color="#0b0e12" roughness={0.6} />
        </mesh>
      ))}

      {/* wheels */}
      {WHEEL.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, 0.3, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.3, 0.3, 0.26, 18]} />
          <meshStandardMaterial color="#08090b" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
