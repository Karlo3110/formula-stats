import type { Centerline } from './centerline';

export interface TrackCorner {
  /** Apex, as distance from the start/finish line. */
  apex: number;
  /** Where the bend starts and ends (distance; `end` may exceed the lap length). */
  start: number;
  end: number;
  /** Lateral side of the inside of the bend: +1 left, -1 right. */
  inside: 1 | -1;
}

// Turn measured over ~2 track widths either side of a point.
const WINDOW_TRACK_WIDTHS = 2;
// Peak heading change (radians over the window) that counts as a corner.
const CORNER_ANGLE = 0.3;
const SPAN_ANGLE = CORNER_ANGLE * 0.5;
const MIN_APEX_GAP_TRACK_WIDTHS = 5;

/** Signed heading change at each vertex; positive turns left. */
function turnAngles(centerline: Centerline, window: number): number[] {
  return Array.from({ length: centerline.size }, (_, i) => {
    const a = centerline.pointAt(i - window);
    const b = centerline.pointAt(i);
    const c = centerline.pointAt(i + window);
    const v1x = b.x - a.x;
    const v1z = b.z - a.z;
    const v2x = c.x - b.x;
    const v2z = c.z - b.z;
    // Left of travel is (tz, -tx) in scene axes, so this cross is positive for a left turn.
    return Math.atan2(v2x * v1z - v2z * v1x, v1x * v2x + v1z * v2z);
  });
}

function isPeak(angles: ReadonlyArray<number>, i: number): boolean {
  const n = angles.length;
  const here = Math.abs(angles[i] ?? 0);
  return (
    here >= CORNER_ANGLE &&
    here >= Math.abs(angles[(i - 1 + n) % n] ?? 0) &&
    here > Math.abs(angles[(i + 1) % n] ?? 0)
  );
}

function spanEdge(angles: ReadonlyArray<number>, apex: number, step: 1 | -1): number {
  const n = angles.length;
  const sign = Math.sign(angles[apex] ?? 0);
  let offset = 0;
  while (offset < n / 4) {
    const value = (angles[(apex + (offset + 1) * step + n) % n] ?? 0) * sign;
    if (value < SPAN_ANGLE) break;
    offset += 1;
  }
  return apex + offset * step;
}

/** Corners of the circuit (bends sharp enough for kerbs and TV cameras). */
export function findCorners(centerline: Centerline, trackWidth: number): TrackCorner[] {
  const spacing = centerline.length / centerline.size;
  const window = Math.max(1, Math.round((trackWidth * WINDOW_TRACK_WIDTHS) / spacing));
  const angles = turnAngles(centerline, window);
  const corners: TrackCorner[] = [];
  let lastApex = -Infinity;

  angles.forEach((angle, i) => {
    const apex = centerline.distanceOf(i);
    if (!isPeak(angles, i) || apex - lastApex < trackWidth * MIN_APEX_GAP_TRACK_WIDTHS) return;
    lastApex = apex;
    corners.push({
      apex,
      start: spanEdge(angles, i, -1) * spacing,
      end: spanEdge(angles, i, 1) * spacing,
      inside: angle > 0 ? 1 : -1,
    });
  });
  return corners;
}
