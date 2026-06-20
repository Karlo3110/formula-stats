import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { raceEngine } from '@/lib/race/race-engine';
import { useRaceStore } from '@/stores/use-race-store';

interface RigCameraProps {
  curve: THREE.CatmullRomCurve3;
}

const FOLLOW_BACK = 9;
const FOLLOW_HEIGHT = 4;
const OVERVIEW_RADIUS = 115;
const OVERVIEW_HEIGHT = 72;
const UP = new THREE.Vector3(0, 1, 0);

export function RigCamera({ curve }: RigCameraProps): null {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);

  const scratch = useMemo(
    () => ({
      car: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state) => {
    const { camera, clock } = state;

    if (selectedDriverId) {
      const t = raceEngine.trackT(selectedDriverId);
      curve.getPointAt(t, scratch.car);
      curve.getTangentAt(t, scratch.tangent);
      scratch.desired
        .copy(scratch.car)
        .addScaledVector(scratch.tangent, -FOLLOW_BACK)
        .addScaledVector(UP, FOLLOW_HEIGHT);
      camera.position.lerp(scratch.desired, 0.08);
      scratch.look.lerp(scratch.car, 0.12);
    } else {
      const angle = clock.elapsedTime * 0.04;
      scratch.desired.set(
        Math.sin(angle) * OVERVIEW_RADIUS,
        OVERVIEW_HEIGHT,
        Math.cos(angle) * OVERVIEW_RADIUS,
      );
      camera.position.lerp(scratch.desired, 0.04);
      scratch.look.lerp(scratch.car.set(0, 0, 0), 0.1);
    }

    camera.lookAt(scratch.look);
  });

  return null;
}
