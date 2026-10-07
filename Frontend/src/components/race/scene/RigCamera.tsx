import { useMemo, useRef } from 'react';
import { useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

import {
  CHASE_FOV,
  HELI_FOV,
  chaseShot,
  heliShot,
  isOutOfRange,
  nearestCamera,
  trackSideCameras,
  type CameraShot,
  type FocusPose,
} from '@/lib/race/camera-rig';
import type { Centerline } from '@/lib/race/centerline';
import type { TrackCorner } from '@/lib/race/corners';
import type { RaceSource } from '@/lib/race/types';
import { useRaceStore, type CameraMode } from '@/stores/use-race-store';

interface RigCameraProps {
  source: RaceSource;
  centerline: Centerline;
  corners: ReadonlyArray<TrackCorner>;
  trackWidth: number;
  mode: Exclude<CameraMode, 'orbit'>;
}

const CUT_INTERVAL_SECONDS = 6;
const LEADER_CHECK_SECONDS = 2;
const OVERVIEW = { radius: 260, height: 190, fov: 38, speed: 0.03 } as const;
// Exponential smoothing rates, per second.
const FOLLOW_RATE = 4;
const LOOK_RATE = 8;

function setFov(camera: THREE.Camera, fov: number): void {
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function smoothing(rate: number, delta: number): number {
  return 1 - Math.exp(-rate * delta);
}

interface RigState {
  camIndex: number;
  hold: number;
  leaderId: string | null;
  sinceLeaderCheck: number;
  focusId: string | null;
  look: THREE.Vector3;
  goal: THREE.Vector3;
}

function flyOverview(frame: RootState, rig: RigState, delta: number): void {
  const angle = frame.clock.elapsedTime * OVERVIEW.speed;
  rig.goal.set(Math.sin(angle) * OVERVIEW.radius, OVERVIEW.height, Math.cos(angle) * OVERVIEW.radius);
  frame.camera.position.lerp(rig.goal, smoothing(1, delta));
  rig.look.lerp(rig.goal.set(0, 0, 0), smoothing(LOOK_RATE, delta));
  frame.camera.lookAt(rig.look);
  setFov(frame.camera, OVERVIEW.fov);
}

/**
 * Broadcast camera rig. TV cuts between raised trackside cameras; chase rides
 * behind the car; heli hovers above it. Follows the selected car, else the leader.
 */
export function RigCamera({ source, centerline, corners, trackWidth, mode }: RigCameraProps): null {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const cameras = useMemo(() => trackSideCameras(centerline, corners, trackWidth), [centerline, corners, trackWidth]);
  const rig = useRef<RigState>({
    camIndex: -1,
    hold: 0,
    leaderId: null,
    sinceLeaderCheck: 0,
    focusId: null,
    look: new THREE.Vector3(),
    goal: new THREE.Vector3(),
  });

  useFrame((frame, delta) => {
    const state = rig.current;
    frame.camera.up.set(0, 1, 0);
    state.sinceLeaderCheck += delta;
    if (!selectedDriverId && (!state.leaderId || state.sinceLeaderCheck >= LEADER_CHECK_SECONDS)) {
      state.sinceLeaderCheck = 0;
      state.leaderId = source.standings()[0]?.driver.id ?? null;
    }
    const focusId = selectedDriverId ?? state.leaderId;
    const pose = focusId ? source.pose(focusId) : null;
    if (!pose) {
      flyOverview(frame, state, delta);
      return;
    }
    const isNewFocus = focusId !== state.focusId;
    state.focusId = focusId;
    if (mode === 'tv') {
      cutTv(frame.camera, state, pose, delta, { cameras, isNewFocus, trackWidth });
    } else {
      follow(frame.camera, state, pose, delta, { mode, trackWidth, isNewFocus });
    }
  });

  return null;
}

interface TvOptions {
  cameras: ReadonlyArray<CameraShot>;
  isNewFocus: boolean;
  trackWidth: number;
}

function cutTv(camera: THREE.Camera, state: RigState, pose: FocusPose, delta: number, options: TvOptions): void {
  const { cameras, isNewFocus, trackWidth } = options;
  state.hold += delta;
  const live = cameras[state.camIndex];
  const hasLostCar = !live || isOutOfRange(live, pose, trackWidth);
  if (isNewFocus || hasLostCar || state.hold >= CUT_INTERVAL_SECONDS) {
    state.hold = 0;
    state.camIndex = nearestCamera(cameras, pose, state.camIndex);
    const shot = cameras[state.camIndex];
    if (shot) {
      camera.position.set(shot.position.x, shot.position.y, shot.position.z);
      setFov(camera, shot.fov);
      state.look.set(pose.x, pose.y, pose.z);
    }
  }
  state.look.lerp(state.goal.set(pose.x, pose.y, pose.z), smoothing(LOOK_RATE, delta));
  camera.lookAt(state.look);
}

interface FollowOptions {
  mode: 'chase' | 'heli';
  trackWidth: number;
  isNewFocus: boolean;
}

function follow(camera: THREE.Camera, state: RigState, pose: FocusPose, delta: number, options: FollowOptions): void {
  const { mode, trackWidth, isNewFocus } = options;
  state.hold = 0;
  state.camIndex = -1;
  const chase = chaseShot(pose, trackWidth);
  const position = mode === 'chase' ? chase.position : heliShot(pose, trackWidth);
  const look = mode === 'chase' ? chase.look : pose;
  state.goal.set(position.x, position.y, position.z);
  if (isNewFocus) {
    camera.position.copy(state.goal);
    state.look.set(look.x, look.y, look.z);
  } else {
    camera.position.lerp(state.goal, smoothing(FOLLOW_RATE, delta));
    state.look.lerp(state.goal.set(look.x, look.y, look.z), smoothing(LOOK_RATE, delta));
  }
  camera.lookAt(state.look);
  setFov(camera, mode === 'chase' ? CHASE_FOV : HELI_FOV);
}
