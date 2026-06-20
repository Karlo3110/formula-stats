import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

interface RigCameraProps {
  source: RaceSource;
}

// Helicopter / TV-broadcast follow: elevated and trailing the car with a slight
// 3/4 side offset, angled down.
const FOLLOW_BACK = 12;
const FOLLOW_HEIGHT = 7;
const FOLLOW_SIDE = 4;
const FOLLOW_FOV = 40;
const FOLLOW_LOOK_LIFT = 0.6;

const OVERVIEW_RADIUS = 235;
const OVERVIEW_HEIGHT = 155;
const OVERVIEW_FOV = 38;

const WORLD_UP = new THREE.Vector3(0, 1, 0);

function setFov(camera: THREE.Camera, fov: number): void {
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

export function RigCamera({ source }: RigCameraProps): null {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);

  const scratch = useMemo(
    () => ({
      forward: new THREE.Vector3(),
      side: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      look: new THREE.Vector3(),
      car: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state) => {
    const { camera, clock } = state;
    camera.up.lerp(WORLD_UP, 0.1).normalize();

    const pose = selectedDriverId ? source.pose(selectedDriverId) : null;
    if (pose) {
      scratch.car.set(pose.x, 0, pose.z);
      scratch.forward.set(Math.sin(pose.headingY), 0, Math.cos(pose.headingY)).normalize();
      scratch.side.copy(scratch.forward).cross(WORLD_UP).normalize();

      scratch.desired
        .copy(scratch.car)
        .addScaledVector(scratch.forward, -FOLLOW_BACK)
        .addScaledVector(WORLD_UP, FOLLOW_HEIGHT)
        .addScaledVector(scratch.side, FOLLOW_SIDE);
      camera.position.lerp(scratch.desired, 0.08);

      scratch.car.y += FOLLOW_LOOK_LIFT;
      scratch.look.lerp(scratch.car, 0.16);
      setFov(camera, FOLLOW_FOV);
    } else {
      const angle = clock.elapsedTime * 0.04;
      scratch.desired.set(
        Math.sin(angle) * OVERVIEW_RADIUS,
        OVERVIEW_HEIGHT,
        Math.cos(angle) * OVERVIEW_RADIUS,
      );
      camera.position.lerp(scratch.desired, 0.04);
      scratch.look.lerp(scratch.car.set(0, 0, 0), 0.1);
      setFov(camera, OVERVIEW_FOV);
    }

    camera.lookAt(scratch.look);
  });

  return null;
}
