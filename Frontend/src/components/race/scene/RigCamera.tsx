import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { raceEngine } from '@/lib/race/race-engine';
import { useRaceStore } from '@/stores/use-race-store';

interface RigCameraProps {
  curve: THREE.CatmullRomCurve3;
}

// Helicopter / TV-broadcast follow: elevated and trailing the car with a slight
// 3/4 side offset, angled down — the classic on-track tracking shot.
const FOLLOW_BACK = 17;
const FOLLOW_HEIGHT = 11;
const FOLLOW_SIDE = 6;
const FOLLOW_FOV = 40;
const FOLLOW_LOOK_LIFT = 0.6;

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
      heading: new THREE.Vector3(),
      side: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state) => {
    const { camera, clock } = state;
    camera.up.lerp(WORLD_UP, 0.1).normalize();

    if (selectedDriverId) {
      const t = raceEngine.trackT(selectedDriverId);
      curve.getPointAt(t, scratch.car);
      curve.getTangentAt(t, scratch.tangent);
      scratch.heading.set(scratch.tangent.x, 0, scratch.tangent.z).normalize();
      scratch.side.copy(scratch.heading).cross(WORLD_UP).normalize();

      scratch.desired
        .copy(scratch.car)
        .addScaledVector(scratch.heading, -FOLLOW_BACK)
        .addScaledVector(WORLD_UP, FOLLOW_HEIGHT)
        .addScaledVector(scratch.side, FOLLOW_SIDE);
      camera.position.lerp(scratch.desired, 0.07);

      scratch.car.y += FOLLOW_LOOK_LIFT;
      scratch.look.lerp(scratch.car, 0.15);
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
