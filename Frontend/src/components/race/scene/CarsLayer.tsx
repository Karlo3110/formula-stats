import { useMemo, useRef, type JSX } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import { RACE_DRIVERS, raceEngine } from '@/lib/race/race-engine';
import { useRaceStore } from '@/stores/use-race-store';

import { CarModel } from './CarModel';

interface CarsLayerProps {
  curve: THREE.CatmullRomCurve3;
}

const CAR_LIFT = 0.15;

export function CarsLayer({ curve }: CarsLayerProps): JSX.Element {
  const groups = useRef<Array<THREE.Group | null>>([]);
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const selectDriver = useRaceStore((state) => state.selectDriver);

  const scratch = useMemo(
    () => ({ point: new THREE.Vector3(), tangent: new THREE.Vector3() }),
    [],
  );

  useFrame(() => {
    RACE_DRIVERS.forEach((driver, index) => {
      const group = groups.current[index];
      if (!group) {
        return;
      }
      const t = raceEngine.trackT(driver.id);
      curve.getPointAt(t, scratch.point);
      curve.getTangentAt(t, scratch.tangent);
      group.position.set(
        scratch.point.x,
        scratch.point.y + CAR_LIFT,
        scratch.point.z,
      );
      group.rotation.y = Math.atan2(scratch.tangent.x, scratch.tangent.z);
    });
  });

  return (
    <group>
      {RACE_DRIVERS.map((driver, index) => {
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
              <Html position={[0, 1.6, 0]} center distanceFactor={28} occlude={false}>
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
