import type { ScenePoint } from './scene-coords';

export interface TrackPlacement {
  x: number;
  y: number;
  z: number;
  /** Unit direction of travel on the ground plane. */
  tangentX: number;
  tangentZ: number;
}

const MIN_POINTS = 3;

function wrap(distance: number, length: number): number {
  return ((distance % length) + length) % length;
}

/**
 * Closed circuit centre-line as a polyline with cumulative arc length. Car
 * progress from the replay is measured along exactly this polyline on the
 * server, so placing cars here keeps them on the drawn road.
 */
export class Centerline {
  readonly points: ReadonlyArray<ScenePoint>;
  /** Geometric length of the polyline, world units. */
  readonly length: number;
  /** Lap length the replay's progress is measured in (the server's, unrounded). */
  readonly lapLength: number;
  /** Arc length at each point; distances[0] is 0 (the start/finish line). */
  private readonly distances: Float64Array;

  constructor(points: ReadonlyArray<ScenePoint>, lapLength?: number) {
    if (points.length < MIN_POINTS) {
      throw new Error(`A centre-line needs at least ${MIN_POINTS} points.`);
    }
    this.points = points;
    this.distances = new Float64Array(points.length);
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += planarDistance(points[i - 1], points[i]);
      this.distances[i] = total;
    }
    this.length = total + planarDistance(points[points.length - 1], points[0]);
    this.lapLength = lapLength !== undefined && lapLength > 0 ? lapLength : this.length;
  }

  /**
   * Converts cumulative replay progress into a distance on this polyline.
   * Wrapping by the server's lap length (not the rounded polyline's) stops
   * a fraction of a unit of drift per lap adding up over a race.
   */
  fromProgress(progress: number): number {
    return wrap(progress, this.lapLength) * (this.length / this.lapLength);
  }

  get size(): number {
    return this.points.length;
  }

  /** Point `lateral` units left of the centre-line at `distance` along it (any lap). */
  place(distance: number, lateral: number): TrackPlacement {
    const s = wrap(distance, this.length);
    const index = this.segmentAt(s);
    const a = this.pointAt(index);
    const b = this.pointAt(index + 1);
    const segmentStart = this.distances[index] ?? 0;
    const segmentLength = planarDistance(a, b) || 1;
    const t = Math.min(1, Math.max(0, (s - segmentStart) / segmentLength));
    const tangentX = (b.x - a.x) / segmentLength;
    const tangentZ = (b.z - a.z) / segmentLength;
    // Left normal of (tx, tz) in scene axes; matches the server's (-dy, dx)
    // because scene z is the negated circuit y.
    return {
      x: a.x + (b.x - a.x) * t + tangentZ * lateral,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t - tangentX * lateral,
      tangentX,
      tangentZ,
    };
  }

  /** Point at a fraction (0..1) of the lap, on the centre-line. */
  placeAtFraction(fraction: number): TrackPlacement {
    return this.place(fraction * this.length, 0);
  }

  /** Arc length of a vertex from the start/finish line. */
  distanceOf(index: number): number {
    return this.distances[index] ?? 0;
  }

  pointAt(index: number): ScenePoint {
    const n = this.points.length;
    return this.points[((index % n) + n) % n] as ScenePoint;
  }

  /** Index of the segment containing arc length `s` (binary search). */
  private segmentAt(s: number): number {
    let low = 0;
    let high = this.distances.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if ((this.distances[mid] ?? 0) <= s) low = mid;
      else high = mid - 1;
    }
    return low;
  }
}

function planarDistance(a: ScenePoint | undefined, b: ScenePoint | undefined): number {
  if (!a || !b) return 0;
  return Math.hypot(b.x - a.x, b.z - a.z);
}
