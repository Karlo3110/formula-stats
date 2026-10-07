import type { Centerline } from './centerline';
import type { TrackCorner } from './corners';

export interface CameraShot {
  position: { x: number; y: number; z: number };
  fov: number;
}

export interface FocusPose {
  x: number;
  y: number;
  z: number;
  headingY: number;
}

// Distances in track widths (a track width is ~14 m), so framing is the same
// whatever the circuit's world scale.
const TV_SETBACK = 9;
const TV_HEIGHT = 5;
const TV_FOV = 24;
const MIN_TV_CAMS = 5;
const FALLBACK_TV_CAMS = 12;

const CHASE_BACK = 1.5;
const CHASE_HEIGHT = 0.6;
const CHASE_LOOK_AHEAD = 1.4;
export const CHASE_FOV = 55;

const HELI_BACK = 9;
const HELI_HEIGHT = 22;
export const HELI_FOV = 38;

/** Trackside broadcast cameras: raised on the outside of each corner, looking in. */
export function trackSideCameras(
  centerline: Centerline,
  corners: ReadonlyArray<TrackCorner>,
  trackWidth: number,
): CameraShot[] {
  const spots =
    corners.length >= MIN_TV_CAMS
      ? corners.map((corner) => ({ distance: corner.apex, outside: -corner.inside }))
      : Array.from({ length: FALLBACK_TV_CAMS }, (_, i) => ({
          distance: (centerline.length * i) / FALLBACK_TV_CAMS,
          outside: i % 2 === 0 ? 1 : -1,
        }));
  return spots.map(({ distance, outside }) => {
    const spot = centerline.place(distance, outside * trackWidth * TV_SETBACK);
    return { position: { x: spot.x, y: spot.y + trackWidth * TV_HEIGHT, z: spot.z }, fov: TV_FOV };
  });
}

/** Beyond this distance (in track widths) a trackside camera has lost the car. */
const TV_RANGE = TV_SETBACK * 3;

export function isOutOfRange(shot: CameraShot, car: { x: number; z: number }, trackWidth: number): boolean {
  return Math.hypot(shot.position.x - car.x, shot.position.z - car.z) > trackWidth * TV_RANGE;
}

/** Index of the camera nearest the car, other than the one currently live. */
export function nearestCamera(
  cameras: ReadonlyArray<CameraShot>,
  car: { x: number; z: number },
  exclude: number,
): number {
  let best = 0;
  let bestDistance = Infinity;
  cameras.forEach((camera, index) => {
    if (index === exclude && cameras.length > 1) return;
    const distance = (camera.position.x - car.x) ** 2 + (camera.position.z - car.z) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

function behind(focus: FocusPose, back: number, height: number): { x: number; y: number; z: number } {
  return {
    x: focus.x - Math.sin(focus.headingY) * back,
    y: focus.y + height,
    z: focus.z - Math.cos(focus.headingY) * back,
  };
}

/** On-board style chase camera: behind and above the car, looking down the road. */
export function chaseShot(focus: FocusPose, trackWidth: number): { position: CameraShot['position']; look: CameraShot['position'] } {
  return {
    position: behind(focus, trackWidth * CHASE_BACK, trackWidth * CHASE_HEIGHT),
    look: behind(focus, -trackWidth * CHASE_LOOK_AHEAD, 0),
  };
}

/** Helicopter shot: high above and a little behind the car. */
export function heliShot(focus: FocusPose, trackWidth: number): CameraShot['position'] {
  return behind(focus, trackWidth * HELI_BACK, trackWidth * HELI_HEIGHT);
}
