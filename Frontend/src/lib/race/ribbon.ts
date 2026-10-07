import * as THREE from 'three';

import type { Centerline } from './centerline';

/** A point on a path that follows the circuit: distance along it plus a lateral offset. */
export interface SpineSample {
  distance: number;
  lateral: number;
}

export interface RibbonOptions {
  /** Edges relative to the spine, world units (left positive). */
  inner: number;
  outer: number;
  /** Height above the circuit surface, to layer road markings without z-fighting. */
  lift: number;
  /** World units of path per texture repeat along the ribbon. */
  textureLength?: number;
  /** Pins the outer edge to this absolute height (e.g. an embankment down to the ground). */
  outerHeight?: number;
  /** Per-sample colour (e.g. kerb stripes), as a hex number. */
  colorAt?: (distance: number) => number;
}

/** Spine on the centre-line itself: one sample per vertex, closing the loop. */
export function loopSpine(centerline: Centerline): SpineSample[] {
  const spine = Array.from({ length: centerline.size }, (_, i) => ({ distance: centerline.distanceOf(i), lateral: 0 }));
  spine.push({ distance: centerline.length, lateral: 0 });
  return spine;
}

/** Spine along a stretch of the centre-line at a fixed offset, sampled every `step`. */
export function stretchSpine(from: number, to: number, step: number, lateral: number): SpineSample[] {
  const count = Math.max(1, Math.ceil((to - from) / step));
  return Array.from({ length: count + 1 }, (_, i) => ({ distance: from + ((to - from) * i) / count, lateral }));
}

/** Flat strip between two offsets of a spine, draped over the circuit's elevation. */
export function buildRibbon(
  centerline: Centerline,
  spine: ReadonlyArray<SpineSample>,
  options: RibbonOptions,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const color = new THREE.Color();
  const textureLength = options.textureLength ?? 1;

  spine.forEach((sample, i) => {
    const inner = centerline.place(sample.distance, sample.lateral + options.inner);
    const outer = centerline.place(sample.distance, sample.lateral + options.outer);
    positions.push(inner.x, inner.y + options.lift, inner.z);
    positions.push(outer.x, options.outerHeight ?? outer.y + options.lift, outer.z);
    const v = (sample.distance - (spine[0]?.distance ?? 0)) / textureLength;
    uvs.push(0, v, 1, v);
    if (options.colorAt) {
      color.setHex(options.colorAt(sample.distance));
      colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    }
    if (i < spine.length - 1) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (options.colorAt) {
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
