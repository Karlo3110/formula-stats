import type { JSX } from 'react';

interface CarModelProps {
  color: string;
  scale: number;
}

// Model units: ~1.33 m each, so the car is ~5.6 m long and ~2 m wide (forward = +Z).
const CARBON = '#121417';
const TYRE = '#0a0a0b';
const WHEELS: ReadonlyArray<readonly [number, number, number]> = [
  [0.62, 0.3, 1.0],
  [-0.62, 0.3, 1.0],
  [0.64, 0.32, -1.02],
  [-0.64, 0.32, -1.02],
];

function Paint({ color }: { color: string }): JSX.Element {
  return <meshStandardMaterial color={color} metalness={0.35} roughness={0.38} />;
}

function Carbon(): JSX.Element {
  return <meshStandardMaterial color={CARBON} metalness={0.2} roughness={0.55} />;
}

/** Low-poly modern F1 car in team livery: floor, sidepods, halo, wings, tyres. */
export function CarModel({ color, scale }: CarModelProps): JSX.Element {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.07, -0.1]}>
        <boxGeometry args={[1.25, 0.05, 3.0]} />
        <Carbon />
      </mesh>
      <mesh position={[0, 0.3, -0.05]}>
        <boxGeometry args={[0.52, 0.3, 2.3]} />
        <Paint color={color} />
      </mesh>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.24, -0.25]}>
          <boxGeometry args={[0.36, 0.26, 1.15]} />
          <Paint color={color} />
        </mesh>
      ))}
      <mesh position={[0, 0.48, -0.75]}>
        <boxGeometry args={[0.26, 0.2, 0.9]} />
        <Paint color={color} />
      </mesh>
      <mesh position={[0, 0.25, 1.45]}>
        <boxGeometry args={[0.24, 0.14, 1.1]} />
        <Paint color={color} />
      </mesh>
      <mesh position={[0, 0.1, 2.0]}>
        <boxGeometry args={[1.5, 0.04, 0.36]} />
        <Paint color={color} />
      </mesh>
      {[-0.74, 0.74].map((x) => (
        <mesh key={x} position={[x, 0.16, 2.0]}>
          <boxGeometry args={[0.04, 0.16, 0.4]} />
          <Carbon />
        </mesh>
      ))}
      <mesh position={[0, 0.56, 0.12]}>
        <torusGeometry args={[0.22, 0.035, 6, 16, Math.PI]} />
        <Carbon />
      </mesh>
      <mesh position={[0, 0.42, 0.1]}>
        <boxGeometry args={[0.3, 0.06, 0.5]} />
        <Carbon />
      </mesh>
      <mesh position={[0, 0.62, -1.42]}>
        <boxGeometry args={[1.1, 0.24, 0.16]} />
        <Paint color={color} />
      </mesh>
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.52, -1.4]}>
          <boxGeometry args={[0.04, 0.36, 0.36]} />
          <Carbon />
        </mesh>
      ))}
      {WHEELS.map(([x, radius, z]) => (
        <mesh key={`${x}:${z}`} position={[x, radius, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[radius, radius, 0.3, 20]} />
          <meshStandardMaterial color={TYRE} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
