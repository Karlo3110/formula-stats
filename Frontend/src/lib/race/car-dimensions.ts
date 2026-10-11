// The car model is ~4.4 x 1.5 model units (5.6 m x 2 m); one model unit is
// 0.1 track widths, which is true scale for a ~14 m wide circuit.
const MODEL_LENGTH = 4.4;
const MODEL_WIDTH = 1.5;
const SCALE_PER_TRACK_WIDTH = 0.1;

/** Scale to apply to the car model on a circuit of this width (world units). */
export function carScale(trackWidth: number): number {
  return trackWidth * SCALE_PER_TRACK_WIDTH;
}

export interface CarFootprint {
  length: number;
  width: number;
}

/** A car's length and width in world units on a circuit of this width. */
export function carFootprint(trackWidth: number): CarFootprint {
  const scale = carScale(trackWidth);
  return { length: MODEL_LENGTH * scale, width: MODEL_WIDTH * scale };
}
