import type { PairSide, RoadSlot, SideChooser } from './car-spacing';

function orient(side: PairSide, orientation: PairSide): PairSide {
  return side === orientation ? 1 : -1;
}

function pairKey(first: RoadSlot, second: RoadSlot): string {
  return first.id < second.id ? `${first.id}:${second.id}` : `${second.id}:${first.id}`;
}

/**
 * Remembers, for each pair of cars alongside each other, which side each is
 * on — decided when they first draw alongside and kept until they separate.
 * Without this, GPS noise in their lateral order flips them across each
 * other mid-overtake.
 */
export class StickySides implements SideChooser {
  private readonly sides = new Map<string, PairSide>();
  private readonly seen = new Set<string>();

  /** Call before each re-spacing pass. */
  beginFrame(): void {
    this.seen.clear();
  }

  /** Call after each pass: pairs no longer alongside are forgotten. */
  endFrame(): void {
    for (const key of this.sides.keys()) {
      if (!this.seen.has(key)) this.sides.delete(key);
    }
  }

  sideOf = (first: RoadSlot, second: RoadSlot, separation: number): PairSide => {
    const key = pairKey(first, second);
    this.seen.add(key);
    // Stored relative to the lower id, so the answer is the same whichever car comes first.
    const orientation: PairSide = first.id < second.id ? 1 : -1;
    const stored = this.sides.get(key);
    if (stored !== undefined) return orient(stored, orientation);
    const side: PairSide = separation < 0 ? -1 : 1;
    this.sides.set(key, orient(side, orientation));
    return side;
  };
}
