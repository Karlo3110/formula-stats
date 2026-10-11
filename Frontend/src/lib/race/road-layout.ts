import { separateAlongside, type SpacingRoad } from './car-spacing';

export interface LayoutEntry {
  distance: number;
  lateral: number;
  /** Only cars racing on the road are spaced; pit lane and retired cars keep their line. */
  isRunning: boolean;
}

// Replay seconds for a car to ease most of the way to its spaced line.
const EASE_SECONDS = 0.35;

/** Each car's lateral offset after spacing, eased over time so cars never jump. */
export class RoadLayout {
  private laterals: number[] = [];

  constructor(private readonly road: SpacingRoad) {}

  /** Re-spaces the field; `dt` is replay time since the last update, or null to snap (seek). */
  update(entries: ReadonlyArray<LayoutEntry>, dt: number | null): void {
    const targets = this.targetsOf(entries);
    const ease = dt === null || this.laterals.length !== targets.length ? 1 : 1 - Math.exp(-dt / EASE_SECONDS);
    this.laterals = targets.map((target, i) => {
      const current = this.laterals[i] ?? target;
      return current + (target - current) * ease;
    });
  }

  lateral(index: number): number {
    return this.laterals[index] ?? 0;
  }

  private targetsOf(entries: ReadonlyArray<LayoutEntry>): number[] {
    const running = entries.flatMap((entry, index) => (entry.isRunning ? [index] : []));
    const spaced = separateAlongside(
      running.map((index) => entries[index] ?? { distance: 0, lateral: 0 }),
      this.road,
    );
    const targets = entries.map((entry) => entry.lateral);
    running.forEach((index, k) => {
      targets[index] = spaced[k] ?? targets[index] ?? 0;
    });
    return targets;
  }
}
