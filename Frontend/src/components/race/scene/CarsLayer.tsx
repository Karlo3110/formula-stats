import { useRef, type JSX } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { CarStatus, type RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

import { CarModel } from './CarModel';

interface CarsLayerProps {
  source: RaceSource;
  trackWidth: number;
}

// A car is ~0.4 track widths long; 0.1 track widths per model unit is true scale.
const CAR_SCALE_PER_TRACK_WIDTH = 0.1;
const CAR_LIFT = 0.01;
// Heading eases so the polyline's segment-to-segment kinks never show.
const HEADING_EASE = 0.35;
const SELECTION_RING = { inner: 2.6, outer: 3.0 } as const;
const LABEL_HEIGHT = 2.4;
// Constant on-screen size, lifted clear of the car so it never hides it.
const LABEL_STYLE = { transform: 'translateY(-1.6rem)', pointerEvents: 'none' } as const;

function easeAngle(current: number, goal: number, t: number): number {
  const twoPi = Math.PI * 2;
  let delta = (goal - current) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  return current + delta * t;
}

/** Every car at its replayed position; retired cars leave the circuit. */
export function CarsLayer({ source, trackWidth }: CarsLayerProps): JSX.Element {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);
  const scale = trackWidth * CAR_SCALE_PER_TRACK_WIDTH;

  useFrame(() => {
    source.drivers.forEach((driver, index) => {
      const group = groups.current[index];
      const pose = source.pose(driver.id);
      if (!group || !pose) return;
      group.visible = pose.status !== CarStatus.Out;
      group.position.set(pose.x, pose.y + CAR_LIFT, pose.z);
      group.rotation.y = easeAngle(group.rotation.y, pose.headingY, HEADING_EASE);
    });
  });

  return (
    <group>
      {source.drivers.map((driver, index) => {
        const isSelected = driver.id === selectedDriverId;
        return (
          <group
            key={driver.id}
            ref={(element) => {
              groups.current[index] = element;
            }}
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              selectDriver(driver.id);
            }}
          >
            <CarModel color={driver.color} scale={scale} />
            {isSelected ? (
              <>
                <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} scale={scale}>
                  <ringGeometry args={[SELECTION_RING.inner, SELECTION_RING.outer, 40]} />
                  <meshBasicMaterial color="#4c8dff" transparent opacity={0.75} depthWrite={false} />
                </mesh>
                <Html position={[0, scale * LABEL_HEIGHT, 0]} center occlude={false} style={LABEL_STYLE}>
                  <div className="whitespace-nowrap rounded-full border border-primary/60 bg-background/85 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-primary">
                    {driver.code}
                  </div>
                </Html>
              </>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
