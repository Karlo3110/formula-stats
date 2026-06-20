import type { JSX } from 'react';

interface CarModelProps {
  color: string;
  selected: boolean;
}

/** Low-poly F1 silhouette, forward = +Z. Kept to a handful of meshes for mobile. */
export function CarModel({ color, selected }: CarModelProps): JSX.Element {
  const emissiveIntensity = selected ? 0.9 : 0.25;

  return (
    <group scale={selected ? 1.15 : 1}>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.9, 0.32, 2.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      <mesh position={[0, 0.34, 1.55]}>
        <boxGeometry args={[0.42, 0.2, 1.1]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.55, 0.1]}>
        <boxGeometry args={[0.5, 0.34, 0.7]} />
        <meshStandardMaterial color="#0b0f10" metalness={0.2} roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.18, 1.95]}>
        <boxGeometry args={[1.7, 0.08, 0.34]} />
        <meshStandardMaterial color="#0b0f10" metalness={0.3} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.62, -1.45]}>
        <boxGeometry args={[1.4, 0.44, 0.18]} />
        <meshStandardMaterial color="#0b0f10" metalness={0.3} roughness={0.5} />
      </mesh>

      {[
        [0.6, 1.05] as const,
        [-0.6, 1.05] as const,
        [0.62, -1.05] as const,
        [-0.62, -1.05] as const,
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, 0.28, z]}>
          <boxGeometry args={[0.28, 0.5, 0.62]} />
          <meshStandardMaterial color="#070a0b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
