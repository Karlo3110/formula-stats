import { useMemo, useRef, type JSX } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import type { RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

import { CarModel } from './CarModel';

interface CarsLayerProps {
  source: RaceSource;
  carScale: number;
}

const CAR_LIFT = 0.02;
const SNAP_DISTANCE = 12;
const POSITION_LERP = 0.25;
const ROTATION_LERP = 0.18;

function lerpAngle(current: number, goal: number, t: number): number {
  const twoPi = Math.PI * 2;
  let delta = (goal - current) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  if (delta < -Math.PI) delta += twoPi;
  return current + delta * t;
}

export function CarsLayer({ source, carScale }: CarsLayerProps): JSX.Element {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const offMarkers = useRef<Array<THREE.Mesh | null>>([]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);

  useFrame(() => {
    source.drivers.forEach((driver, index) => {
      const group = groups.current[index];
      if (!group) return;
      const pose = source.pose(driver.id);
      if (!pose) return;
      // Sit the car on the track surface (pose.y is real circuit elevation).
      target.set(pose.x, pose.y + CAR_LIFT, pose.z);
      // Snap on big jumps (initial placement, loop wrap); otherwise ease for
      // smooth motion and turning.
      if (group.position.distanceTo(target) > SNAP_DISTANCE) {
        group.position.copy(target);
        group.rotation.y = pose.headingY;
      } else {
        group.position.lerp(target, POSITION_LERP);
        group.rotation.y = lerpAngle(group.rotation.y, pose.headingY, ROTATION_LERP);
      }
      // Real on/off-track flag from the position telemetry: flag a car in run-off.
      const marker = offMarkers.current[index];
      if (marker) {
        marker.visible = !pose.onTrack;
      }
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
            <CarModel color={driver.color} selected={isSelected} scale={carScale} />
            <mesh
              ref={(element) => {
                offMarkers.current[index] = element;
              }}
              visible={false}
              rotation-x={-Math.PI / 2}
              position={[0, 0.05, 0]}
            >
              <ringGeometry args={[1.7, 2.1, 28]} />
              <meshBasicMaterial
                color="#f5a623"
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {isSelected ? (
              <Html position={[0, 1.6, 0]} center distanceFactor={40} occlude={false}>
                <div className="whitespace-nowrap rounded-full border border-primary/60 bg-background/85 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-primary">
                  {driver.code}
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
