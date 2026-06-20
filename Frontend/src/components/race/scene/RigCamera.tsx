import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { raceEngine } from '@/lib/race/race-engine';
import { useRaceStore } from '@/stores/use-race-store';

interface RigCameraProps {
  curve: THREE.CatmullRomCurve3;
}

// Top-down "broadcast comparison" follow: camera straight above the car,
// looking down, oriented so the car's heading points up on screen. High
// altitude + narrow FOV approximates an orthographic map view.
const FOLLOW_HEIGHT = 32;
const FOLLOW_FOV = 26;
const OVERVIEW_RADIUS = 115;
const OVERVIEW_HEIGHT = 72;
const OVERVIEW_FOV = 38;

const WORLD_UP = new THREE.Vector3(0, 1, 0);

function setFov(camera: THREE.Camera, fov: number): void {
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

export function RigCamera({ curve }: RigCameraProps): null {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);

  const scratch = useMemo(
    () => ({
      car: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      look: new THREE.Vector3(),
      up: new THREE.Vector3(0, 0, -1),
    }),
    [],
  );

  useFrame((state) => {
    const { camera, clock } = state;

    if (selectedDriverId) {
      const t = raceEngine.trackT(selectedDriverId);
      curve.getPointAt(t, scratch.car);
      curve.getTangentAt(t, scratch.tangent);

      scratch.desired.copy(scratch.car).addScaledVector(WORLD_UP, FOLLOW_HEIGHT);
      camera.position.lerp(scratch.desired, 0.1);

      // Orient screen-up to the car's horizontal heading (heading-up map).
      scratch.up.set(scratch.tangent.x, 0, scratch.tangent.z).normalize();
      camera.up.lerp(scratch.up, 0.12).normalize();

      scratch.look.lerp(scratch.car, 0.18);
      setFov(camera, FOLLOW_FOV);
    } else {
      const angle = clock.elapsedTime * 0.04;
      scratch.desired.set(
        Math.sin(angle) * OVERVIEW_RADIUS,
        OVERVIEW_HEIGHT,
        Math.cos(angle) * OVERVIEW_RADIUS,
      );
      camera.position.lerp(scratch.desired, 0.04);
      camera.up.lerp(WORLD_UP, 0.1).normalize();
      scratch.look.lerp(scratch.car.set(0, 0, 0), 0.1);
      setFov(camera, OVERVIEW_FOV);
    }

    camera.lookAt(scratch.look);
  });

  return null;
}
