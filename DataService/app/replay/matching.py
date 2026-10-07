"""Map-matching: GPS positions → distance along the lap + sideways offset.

Cars are later drawn at `progress` along the client's track curve, offset by
`lateral` along its normal, so they always follow the drawn road. Matching is
continuity-tracked (search just ahead of the previous match) so a car is never
snapped to a different part of the circuit that happens to pass nearby.
"""

import numpy as np

from app.replay.outline import Outline

# Points searched behind / beyond the step a car can cover between samples.
BACK_WINDOW = 6
FORWARD_MARGIN = 4
# If the windowed match is further than this many track widths away the car
# was lost (e.g. recovered by a crane) and is re-acquired globally.
REACQUIRE_TRACK_WIDTHS = 10.0


def _nearest_index(outline: Outline, px: float, py: float) -> int:
    return int(np.argmin((outline.x - px) ** 2 + (outline.y - py) ** 2))


def _segment_projection(outline: Outline, a: int, px: float, py: float) -> tuple[float, float, float]:
    """(squared distance, arc length, signed lateral) of the projection onto a→a+1."""
    n = outline.size
    b = (a + 1) % n
    ax, ay = outline.x[a], outline.y[a]
    dx, dy = outline.x[b] - ax, outline.y[b] - ay
    length_sq = dx * dx + dy * dy or 1e-9
    t = min(1.0, max(0.0, ((px - ax) * dx + (py - ay) * dy) / length_sq))
    qx, qy = ax + t * dx, ay + t * dy
    length = length_sq**0.5
    # Normal = tangent rotated +90° in the x/y plane: (-dy, dx).
    lateral = ((px - qx) * -dy + (py - qy) * dx) / length
    s_start = outline.s[a]
    return (px - qx) ** 2 + (py - qy) ** 2, s_start + t * length, lateral


def _project(outline: Outline, j: int, px: float, py: float) -> tuple[float, float]:
    """Arc length and lateral of a point near vertex j (segments either side)."""
    n = outline.size
    before = _segment_projection(outline, (j - 1) % n, px, py)
    after = _segment_projection(outline, j, px, py)
    d2, s, lateral = before if before[0] < after[0] else after
    # The segment before vertex 0 sits at the end of the lap: express it as a
    # small negative distance so progress stays continuous across the line.
    if j == 0 and before[0] < after[0]:
        s -= outline.lap_length
    return s, lateral


def match_track(
    outline: Outline,
    xs: np.ndarray,
    ys: np.ndarray,
    max_step: float,
    track_width: float,
) -> tuple[np.ndarray, np.ndarray]:
    """Progress (cumulative, world units) and lateral offset for each sample.

    `max_step` is the furthest a car can travel between two samples (world
    units). Progress starts on lap 0, so a car on the grid just behind the
    line has progress slightly below one lap length.
    """
    n = outline.size
    spacing = outline.lap_length / n
    window = np.arange(-BACK_WINDOW, int(np.ceil(max_step / spacing)) + FORWARD_MARGIN + 1)
    reacquire_sq = (REACQUIRE_TRACK_WIDTHS * track_width) ** 2

    progress = np.empty(len(xs))
    lateral = np.empty(len(xs))
    idx = _nearest_index(outline, float(xs[0]), float(ys[0])) if len(xs) else 0
    lap = 0
    for k in range(len(xs)):
        px, py = float(xs[k]), float(ys[k])
        candidates = (idx + window) % n
        d2 = (outline.x[candidates] - px) ** 2 + (outline.y[candidates] - py) ** 2
        best = int(np.argmin(d2))
        j = int(candidates[best])
        if d2[best] > reacquire_sq:
            j = _nearest_index(outline, px, py)
        if j < idx - n // 2:
            lap += 1
        elif j > idx + n // 2:
            lap -= 1
        idx = j
        s, lateral[k] = _project(outline, j, px, py)
        progress[k] = lap * outline.lap_length + s
    return progress, lateral
