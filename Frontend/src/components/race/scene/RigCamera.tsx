import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { findCorners, type TrackCorner } from '@/lib/race/track';
import type { RaceSource } from '@/lib/race/types';
import { useRaceStore } from '@/stores/use-race-store';

interface RigCameraProps {
  source: RaceSource;
  curve: THREE.CatmullRomCurve3;
  trackWidth: number;
}

const MIN_CAMS = 5;
const FALLBACK_CAM_COUNT = 12;
// Camera distances scale with the circuit's track width so framing is
// consistent whatever the car size is.
const CAM_OFFSET_RATIO = 6;
const CAM_HEIGHT_RATIO = 1.6;
const CINEMATIC_FOV = 22;
const CUT_INTERVAL = 5;

const OVERVIEW_RADIUS = 235;
const OVERVIEW_HEIGHT = 155;
const OVERVIEW_FOV = 38;

const WORLD_UP = new THREE.Vector3(0, 1, 0);

interface TracksideCam {
  position: THREE.Vector3;
}

function setFov(camera: THREE.Camera, fov: number): void {
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function evenCorners(curve: THREE.CatmullRomCurve3): TrackCorner[] {
  const corners: TrackCorner[] = [];
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  for (let i = 0; i < FALLBACK_CAM_COUNT; i += 1) {
    const t = i / FALLBACK_CAM_COUNT;
    corners.push({
      position: curve.getPointAt(t, point).clone(),
      tangent: curve.getTangentAt(t, tangent).clone().setY(0).normalize(),
    });
  }
  return corners;
}

/** A trackside TV camera at each corner: outside the bend, low and telephoto. */
function buildCams(
  curve: THREE.CatmullRomCurve3,
  trackWidth: number,
): TracksideCam[] {
  const detected = findCorners(curve);
  const corners = detected.length >= MIN_CAMS ? detected : evenCorners(curve);
  const offset = trackWidth * CAM_OFFSET_RATIO;
  const height = trackWidth * CAM_HEIGHT_RATIO;
  const normal = new THREE.Vector3();

  return corners.map(({ position, tangent }) => {
    normal.copy(tangent).cross(WORLD_UP).normalize();
    const outward = normal.x * position.x + normal.z * position.z >= 0 ? 1 : -1;
    const camera = new THREE.Vector3()
      .copy(position)
      .addScaledVector(normal, offset * outward);
    camera.y = height;
    return { position: camera };
  });
}

export function RigCamera({ source, curve, trackWidth }: RigCameraProps): null {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const cams = useMemo(() => buildCams(curve, trackWidth), [curve, trackWidth]);

  const state = useRef({
    camIndex: -1,
    hold: CUT_INTERVAL,
    leaderId: null as string | null,
    prevSelected: null as string | null,
    look: new THREE.Vector3(),
    car: new THREE.Vector3(),
  });

  useFrame((frame, delta) => {
    const { camera, clock } = frame;
    const s = state.current;
    camera.up.set(0, 1, 0);

    if (s.prevSelected !== selectedDriverId) {
      s.prevSelected = selectedDriverId;
      s.hold = CUT_INTERVAL; // force an immediate cut on selection change
    }

    // Without a followed driver the TV camera tracks the race leader.
    if (!selectedDriverId && !s.leaderId) {
      s.leaderId = source.standings()[0]?.driver.id ?? null;
    }
    const focusId = selectedDriverId ?? s.leaderId;
    const pose = focusId ? source.pose(focusId) : null;

    if (!pose || cams.length === 0) {
      const angle = clock.elapsedTime * 0.04;
      camera.position.lerp(
        s.car.set(
          Math.sin(angle) * OVERVIEW_RADIUS,
          OVERVIEW_HEIGHT,
          Math.cos(angle) * OVERVIEW_RADIUS,
        ),
        0.04,
      );
      s.look.lerp(s.car.set(0, 0, 0), 0.1);
      camera.lookAt(s.look);
      setFov(camera, OVERVIEW_FOV);
      return;
    }

    s.car.set(pose.x, pose.y, pose.z);
    s.hold += delta;
    if (s.hold >= CUT_INTERVAL || s.camIndex < 0) {
      s.hold = 0;
      if (!selectedDriverId) {
        s.leaderId = source.standings()[0]?.driver.id ?? null;
      }
      s.camIndex = nearestCam(cams, s.car, s.camIndex);
      const cam = cams[s.camIndex];
      if (cam) {
        camera.position.copy(cam.position);
      }
      setFov(camera, CINEMATIC_FOV);
    }

    s.look.lerp(s.car, 0.12);
    camera.lookAt(s.look);
  });

  return null;
}

function nearestCam(
  cams: TracksideCam[],
  car: THREE.Vector3,
  exclude: number,
): number {
  let best = 0;
  let bestDist = Infinity;
  cams.forEach((cam, index) => {
    if (index === exclude) return;
    const dx = cam.position.x - car.x;
    const dz = cam.position.z - car.z;
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  });
  return best;
}
