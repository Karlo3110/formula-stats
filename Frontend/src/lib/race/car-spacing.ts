import type { CarFootprint } from './car-dimensions';

/** A running car's place on the road: distance along the centre-line and offset from it. */
export interface RoadSlot {
  /** Stable car identity, so a pair keeps its sides across frames. */
  id: number;
  distance: number;
  lateral: number;
}

/** +1 when the second car of a pair runs to the left of the first. */
export type PairSide = 1 | -1;

/** Decides which side of each other two alongside cars run on. */
export interface SideChooser {
  sideOf: (first: RoadSlot, second: RoadSlot, separation: number) => PairSide;
}

/** Side from the cars' current lateral order (stateless). */
export const CURRENT_SIDE: SideChooser = {
  sideOf: (_first, _second, separation) => (separation < 0 ? -1 : 1),
};

export interface SpacingRoad {
  car: CarFootprint;
  /** Half the road width: cars keep all four wheels inside it. */
  halfWidth: number;
  /** Distance after which `distance` wraps (one lap). */
  lapLength: number;
}

// Cars side by side keep a little air between them.
const SIDE_CLEARANCE = 1.2;
// Overlap fades in between these fractions of a car length nose-to-tail.
const FULL_OVERLAP_AT = 0.8;
const NO_OVERLAP_AT = 1.3;
const ITERATIONS = 4;

function gapAlongTrack(a: number, b: number, lapLength: number): number {
  const delta = Math.abs(a - b) % lapLength;
  return Math.min(delta, lapLength - delta);
}

/** 1 when two cars are alongside, falling to 0 once one is clear ahead. */
function alongsideWeight(a: RoadSlot, b: RoadSlot, road: SpacingRoad): number {
  const gap = gapAlongTrack(a.distance, b.distance, road.lapLength) / road.car.length;
  if (gap <= FULL_OVERLAP_AT) return 1;
  if (gap >= NO_OVERLAP_AT) return 0;
  return (NO_OVERLAP_AT - gap) / (NO_OVERLAP_AT - FULL_OVERLAP_AT);
}

function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value));
}

function pushApart(laterals: number[], i: number, j: number, required: number, limit: number, side: PairSide): void {
  const a = laterals[i] ?? 0;
  const b = laterals[j] ?? 0;
  const separation = side * (b - a);
  if (separation >= required) return;
  const missing = required - separation;
  // A car already against the edge cannot move; the other takes the push.
  const aRoom = limit + side * a;
  const bRoom = limit - side * b;
  const aShare = aRoom <= 0 ? 0 : bRoom <= 0 ? 1 : 0.5;
  laterals[i] = clamp(a - side * missing * aShare, limit);
  laterals[j] = clamp(b + side * missing * (1 - aShare), limit);
}

/**
 * Lateral offsets that keep cars from driving through each other. Position
 * telemetry is 2D and noisy, so two cars fighting wheel to wheel often share
 * one spot; when cars overlap nose-to-tail they are moved apart sideways to at
 * least a car's width, on the side of each other `sides` chooses.
 */
export function separateAlongside(
  slots: ReadonlyArray<RoadSlot>,
  road: SpacingRoad,
  sides: SideChooser = CURRENT_SIDE,
): number[] {
  const laterals = slots.map((slot) => slot.lateral);
  const limit = Math.max(0, road.halfWidth - road.car.width / 2);
  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        const a = slots[i];
        const b = slots[j];
        if (!a || !b) continue;
        const weight = alongsideWeight(a, b, road);
        if (weight === 0) continue;
        const side = sides.sideOf(a, b, (laterals[j] ?? 0) - (laterals[i] ?? 0));
        pushApart(laterals, i, j, road.car.width * SIDE_CLEARANCE * weight, limit, side);
      }
    }
  }
  return laterals;
}
