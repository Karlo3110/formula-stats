import * as THREE from 'three';

export const TRACK_WIDTH = 9;
const RIBBON_SEGMENTS = 800;
const ARC_LENGTH_DIVISIONS = 4000;
const UP = new THREE.Vector3(0, 1, 0);

const CONTROL_POINTS: ReadonlyArray<[number, number, number]> = [
  [0, 0, -52],
  [42, 0, -44],
  [58, 1.5, -12],
  [36, 1.5, 12],
  [48, 0, 42],
  [12, 0, 54],
  [-22, 0, 44],
  [-16, 2, 12],
  [-48, 2, 6],
  [-58, 0, -26],
  [-30, 0, -48],
];

function withDenseArcLengths(
  curve: THREE.CatmullRomCurve3,
): THREE.CatmullRomCurve3 {
  // A dense arc-length LUT keeps getPointAt() smooth so cars don't snap between
  // samples on a long, detailed track.
  curve.arcLengthDivisions = ARC_LENGTH_DIVISIONS;
  curve.updateArcLengths();
  return curve;
}

const APEX_SAMPLES = 400;
const APEX_MIN_GAP = 0.045;

/** Detects corner apexes as local maxima of the track's turn angle. */
export function findApexes(curve: THREE.CatmullRomCurve3): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < APEX_SAMPLES; i += 1) {
    points.push(curve.getPointAt(i / APEX_SAMPLES));
  }

  const angles = points.map((_, i) => {
    const a = points[(i - 1 + APEX_SAMPLES) % APEX_SAMPLES];
    const b = points[i];
    const c = points[(i + 1) % APEX_SAMPLES];
    if (!a || !b || !c) return 0;
    const v1x = b.x - a.x;
    const v1z = b.z - a.z;
    const v2x = c.x - b.x;
    const v2z = c.z - b.z;
    return Math.abs(Math.atan2(v1x * v2z - v1z * v2x, v1x * v2x + v1z * v2z));
  });

  const mean = angles.reduce((sum, v) => sum + v, 0) / angles.length;
  const threshold = mean * 1.8;

  const apexes: THREE.Vector3[] = [];
  let lastT = -1;
  for (let i = 0; i < APEX_SAMPLES; i += 1) {
    const t = i / APEX_SAMPLES;
    const prev = angles[(i - 1 + APEX_SAMPLES) % APEX_SAMPLES] ?? 0;
    const next = angles[(i + 1) % APEX_SAMPLES] ?? 0;
    const here = angles[i] ?? 0;
    if (here > threshold && here >= prev && here > next && t - lastT > APEX_MIN_GAP) {
      const point = points[i];
      if (point) {
        apexes.push(point.clone());
        lastT = t;
      }
    }
  }
  return apexes;
}

export function createTrackCurve(): THREE.CatmullRomCurve3 {
  const points = CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  return withDenseArcLengths(
    new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5),
  );
}

const MIN_TRACK_POINTS = 8;

/**
 * Builds a closed track curve from real FastF1 outline points ([x, y] pairs,
 * mapped to the X/Z ground plane). Falls back to the stylised curve if the
 * outline is too small to be usable.
 */
export function curveFromPoints(
  points: ReadonlyArray<readonly [number, number]>,
): THREE.CatmullRomCurve3 {
  if (points.length < MIN_TRACK_POINTS) {
    return createTrackCurve();
  }
  const vectors = points.map(([x, y]) => new THREE.Vector3(x, 0, y));
  // Centripetal avoids the cusps/loops plain catmullrom produces on dense data.
  return withDenseArcLengths(
    new THREE.CatmullRomCurve3(vectors, true, 'centripetal'),
  );
}

interface TrackGeometry {
  surface: THREE.BufferGeometry;
  leftEdge: THREE.Vector3[];
  rightEdge: THREE.Vector3[];
}

export function buildTrackGeometry(
  curve: THREE.CatmullRomCurve3,
  width: number = TRACK_WIDTH,
): TrackGeometry {
  const half = width / 2;
  const positions: number[] = [];
  const indices: number[] = [];
  const leftEdge: THREE.Vector3[] = [];
  const rightEdge: THREE.Vector3[] = [];

  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= RIBBON_SEGMENTS; i += 1) {
    const t = i / RIBBON_SEGMENTS;
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    // Flatten the tangent to the ground plane so the offset normal stays stable
    // (avoids the ribbon twisting/crossing on noisy curves).
    tangent.y = 0;
    tangent.normalize();
    normal.copy(tangent).cross(UP).normalize();

    const left = new THREE.Vector3().copy(point).addScaledVector(normal, half);
    const right = new THREE.Vector3().copy(point).addScaledVector(normal, -half);
    leftEdge.push(left);
    rightEdge.push(right);

    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

    if (i < RIBBON_SEGMENTS) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const surface = new THREE.BufferGeometry();
  surface.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  surface.setIndex(indices);
  surface.computeVertexNormals();

  return { surface, leftEdge, rightEdge };
}
