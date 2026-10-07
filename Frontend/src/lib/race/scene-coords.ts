export interface ScenePoint {
  x: number;
  /** Elevation above the circuit's lowest point (THREE's up axis). */
  y: number;
  z: number;
}

/** Height of the ground plane the circuit sits on: just under its lowest point. */
export function groundHeight(points: ReadonlyArray<ScenePoint>): number {
  return points.reduce((lowest, point) => Math.min(lowest, point.y), Infinity) - GROUND_DROP;
}

const GROUND_DROP = 0.08;

/**
 * Maps an outline point from the API onto the scene axes. API points are
 * `[x, elevation, y]` in circuit space (y = north); legacy points are `[x, y]`.
 * Scene z is the negated circuit y, so looking down with -z as "up" shows the
 * circuit the right way round instead of mirrored.
 */
export function toScenePoint(point: ReadonlyArray<number>): ScenePoint {
  const hasElevation = point.length >= 3;
  const north = hasElevation ? (point[2] ?? 0) : (point[1] ?? 0);
  return {
    x: point[0] ?? 0,
    y: hasElevation ? (point[1] ?? 0) : 0,
    z: -north,
  };
}
