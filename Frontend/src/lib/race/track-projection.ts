export interface TrackProjection {
  /** SVG path data for the closed circuit outline. */
  path: string;
  /** Square viewBox edge length the outline was fitted into. */
  size: number;
  /** The outline's first point (start/finish line) in SVG coordinates. */
  start: { x: number; y: number };
  /** Maps scene coordinates (x, z) to SVG coordinates. */
  project: (x: number, z: number) => { x: number; y: number };
}

interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Outline points are [x, elevation, y]; legacy points are [x, y].
function planar(point: ReadonlyArray<number>): { x: number; z: number } {
  const x = point[0] ?? 0;
  const z = point.length >= 3 ? (point[2] ?? 0) : (point[1] ?? 0);
  return { x, z };
}

function boundsOf(points: ReadonlyArray<{ x: number; z: number }>): Bounds {
  return points.reduce<Bounds>(
    (b, p) => ({
      minX: Math.min(b.minX, p.x),
      maxX: Math.max(b.maxX, p.x),
      minZ: Math.min(b.minZ, p.z),
      maxZ: Math.max(b.maxZ, p.z),
    }),
    { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity },
  );
}

const MIN_POINTS = 3;

/**
 * Fits a circuit outline into a square SVG viewBox (top-down, same orientation
 * as the 3D overview camera), preserving aspect ratio and centring it.
 * Returns null when the outline is too small to draw.
 */
export function projectTrack(
  outline: ReadonlyArray<ReadonlyArray<number>>,
  size: number,
  padding: number,
): TrackProjection | null {
  if (outline.length < MIN_POINTS) return null;
  const points = outline.map(planar);
  const b = boundsOf(points);
  const span = Math.max(b.maxX - b.minX, b.maxZ - b.minZ) || 1;
  const scale = (size - padding * 2) / span;
  const offsetX = (size - (b.maxX - b.minX) * scale) / 2;
  const offsetY = (size - (b.maxZ - b.minZ) * scale) / 2;

  const project = (x: number, z: number): { x: number; y: number } => ({
    x: offsetX + (x - b.minX) * scale,
    y: offsetY + (z - b.minZ) * scale,
  });

  const path =
    points
      .map((p, index) => {
        const { x, y } = project(p.x, p.z);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  const first = points[0] ?? { x: 0, z: 0 };
  return { path, size, start: project(first.x, first.z), project };
}
