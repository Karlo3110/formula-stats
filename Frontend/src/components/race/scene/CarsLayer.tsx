import { useRef, type JSX } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type * as THREE from 'three';

import type { RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

import { CarModel } from './CarModel';

interface CarsLayerProps {
  source: RaceSource;
}

const CAR_LIFT = 0.15;

export function CarsLayer({ source }: CarsLayerProps): JSX.Element {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);

  useFrame(() => {
    source.drivers.forEach((driver, index) => {
      const group = groups.current[index];
      if (!group) return;
      const pose = source.pose(driver.id);
      if (!pose) return;
      group.position.set(pose.x, CAR_LIFT, pose.z);
      group.rotation.y = pose.headingY;
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
            <CarModel color={driver.color} selected={isSelected} />
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
