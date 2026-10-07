"""Circuit outline: a dense, evenly spaced centre-line built from GPS samples.

Everything here is pure numpy/scipy so it can be tested without FastF1.
Coordinates come in as FastF1 position units (1/10 m) and leave as scene
"world" units (circuit normalised to TRACK_WORLD_SPAN across its widest side).
"""

from dataclasses import dataclass

import numpy as np

TRACK_WORLD_SPAN = 240.0
OUTLINE_POINTS = 800
# Allowed RMS deviation of the spline from the GPS trace, raw units (1/10 m).
# The worst-case deviation is ~3x this, so 0.3 m keeps the centre-line within
# a metre of the real line through hairpins while still removing GPS jitter.
GPS_NOISE_RAW = 3.0
MIN_POINTS = 8


@dataclass(frozen=True)
class Outline:
    """Closed centre-line, index 0 on the start/finish line."""

    x: np.ndarray
    y: np.ndarray
    elevation: np.ndarray
    # Arc length at each point (world units), s[0] == 0.
    s: np.ndarray
    lap_length: float
    # Normalisation that maps raw FastF1 X/Y/Z onto the world.
    center_x: float
    center_y: float
    ground_z: float
    scale: float

    @property
    def size(self) -> int:
        return len(self.x)

    def to_world(self, xs: np.ndarray, ys: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        return (xs - self.center_x) * self.scale, (ys - self.center_y) * self.scale

    def points(self) -> list[list[float]]:
        """[x, elevation, y] triples for the client scene."""
        return [
            [round(float(x), 2), round(float(e), 2), round(float(y), 2)]
            for x, y, e in zip(self.x, self.y, self.elevation)
        ]


def _dedupe(xs: np.ndarray, ys: np.ndarray, zs: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    keep = np.concatenate([[True], (np.diff(xs) != 0) | (np.diff(ys) != 0)])
    return xs[keep], ys[keep], zs[keep]


def _closed_spline(xs: np.ndarray, ys: np.ndarray, zs: np.ndarray, count: int) -> tuple[np.ndarray, ...]:
    """Periodic smoothing spline evaluated at `count` points (raw units)."""
    from scipy.interpolate import splev, splprep

    # splprep(per=1) expects the loop closed: repeat the first point.
    loop = [np.append(values, values[0]) for values in (xs, ys, zs)]
    chord = np.sqrt(np.diff(loop[0]) ** 2 + np.diff(loop[1]) ** 2)
    u = np.concatenate([[0.0], np.cumsum(chord)])
    u /= u[-1]
    smoothing = len(xs) * GPS_NOISE_RAW**2
    tck, _ = splprep(loop, u=u, s=smoothing, per=1)
    dense = np.linspace(0.0, 1.0, count * 4, endpoint=False)
    sx, sy, sz = splev(dense, tck)
    return _even_resample(np.asarray(sx), np.asarray(sy), np.asarray(sz), count)


def _even_resample(xs: np.ndarray, ys: np.ndarray, zs: np.ndarray, count: int) -> tuple[np.ndarray, ...]:
    """Resample a closed polyline to `count` points equally spaced by arc length."""
    cx = np.append(xs, xs[0])
    cy = np.append(ys, ys[0])
    cz = np.append(zs, zs[0])
    seg = np.sqrt(np.diff(cx) ** 2 + np.diff(cy) ** 2)
    cumulative = np.concatenate([[0.0], np.cumsum(seg)])
    targets = np.linspace(0.0, cumulative[-1], count, endpoint=False)
    return (
        np.interp(targets, cumulative, cx),
        np.interp(targets, cumulative, cy),
        np.interp(targets, cumulative, cz),
    )


def build_outline(xs: np.ndarray, ys: np.ndarray, zs: np.ndarray | None = None) -> Outline:
    """Centre-line from one lap of GPS samples (raw FastF1 units), start first."""
    zs = np.zeros(len(xs)) if zs is None else zs
    xs, ys, zs = _dedupe(np.asarray(xs, float), np.asarray(ys, float), np.asarray(zs, float))
    if len(xs) < MIN_POINTS:
        raise ValueError("Not enough position samples to build a circuit outline.")
    try:
        rx, ry, rz = _closed_spline(xs, ys, zs, OUTLINE_POINTS)
    except (ValueError, np.linalg.LinAlgError):
        # A degenerate trace can defeat the spline fit; even spacing still works.
        rx, ry, rz = _even_resample(xs, ys, zs, OUTLINE_POINTS)

    center_x = (float(rx.min()) + float(rx.max())) / 2
    center_y = (float(ry.min()) + float(ry.max())) / 2
    span = max(float(np.ptp(rx)), float(np.ptp(ry))) or 1.0
    scale = TRACK_WORLD_SPAN / span
    ground_z = float(rz.min())

    wx, wy = (rx - center_x) * scale, (ry - center_y) * scale
    closing = np.hypot(wx[0] - wx[-1], wy[0] - wy[-1])
    seg = np.hypot(np.diff(wx), np.diff(wy))
    s = np.concatenate([[0.0], np.cumsum(seg)])
    return Outline(
        x=wx,
        y=wy,
        elevation=(rz - ground_z) * scale,
        s=s,
        lap_length=float(s[-1] + closing),
        center_x=center_x,
        center_y=center_y,
        ground_z=ground_z,
        scale=scale,
    )
