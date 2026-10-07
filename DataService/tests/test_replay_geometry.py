import numpy as np
import pytest

from app.replay.matching import match_track
from app.replay.outline import OUTLINE_POINTS, TRACK_WORLD_SPAN, build_outline

RADIUS_RAW = 5000.0  # 500 m in FastF1 units (1/10 m)


def circle_lap(samples: int = 400, noise: float = 0.0, seed: int = 1) -> tuple[np.ndarray, np.ndarray]:
    """Counter-clockwise circle starting on the +x axis, like one GPS lap."""
    theta = np.linspace(0, 2 * np.pi, samples, endpoint=False)
    rng = np.random.default_rng(seed)
    return (
        RADIUS_RAW * np.cos(theta) + rng.normal(0, noise, samples),
        RADIUS_RAW * np.sin(theta) + rng.normal(0, noise, samples),
    )


def figure_eight(samples: int = 600) -> tuple[np.ndarray, np.ndarray]:
    t = np.linspace(0, 2 * np.pi, samples, endpoint=False)
    return RADIUS_RAW * np.sin(t), RADIUS_RAW * np.sin(t) * np.cos(t)


class TestBuildOutline:
    def test_produces_a_dense_loop_fitted_to_the_world_span(self) -> None:
        outline = build_outline(*circle_lap(noise=10.0))

        assert outline.size == OUTLINE_POINTS
        assert np.ptp(outline.x) == pytest.approx(TRACK_WORLD_SPAN, rel=0.02)

    def test_lap_length_matches_the_circumference(self) -> None:
        outline = build_outline(*circle_lap(noise=10.0))

        assert outline.lap_length == pytest.approx(np.pi * TRACK_WORLD_SPAN, rel=0.01)

    def test_starts_where_the_lap_starts(self) -> None:
        outline = build_outline(*circle_lap())

        assert (outline.x[0], outline.y[0]) == pytest.approx((TRACK_WORLD_SPAN / 2, 0.0), abs=1.0)

    def test_rejects_too_few_samples(self) -> None:
        with pytest.raises(ValueError):
            build_outline(np.arange(3.0), np.arange(3.0))


class TestMatchTrack:
    def setup_method(self) -> None:
        self.outline = build_outline(*circle_lap())
        self.radius = TRACK_WORLD_SPAN / 2

    def drive(self, angles: np.ndarray, radius: float) -> tuple[np.ndarray, np.ndarray]:
        xs, ys = radius * np.cos(angles), radius * np.sin(angles)
        return match_track(self.outline, xs, ys, max_step=40.0, track_width=4.0)

    def test_progress_accumulates_over_two_laps(self) -> None:
        progress, _ = self.drive(np.linspace(0, 4 * np.pi, 200), self.radius)

        assert progress[-1] == pytest.approx(2 * self.outline.lap_length, rel=0.01)
        assert np.all(np.diff(progress) > 0)

    def test_lateral_is_signed_along_the_left_normal(self) -> None:
        # Driving counter-clockwise, the +90 deg normal points to the centre.
        _, lateral = self.drive(np.linspace(0.5, 1.5, 20), self.radius + 2.0)

        assert lateral == pytest.approx(np.full(20, -2.0), abs=0.25)

    def test_grid_slot_behind_the_line_sits_just_under_one_lap(self) -> None:
        progress, _ = self.drive(np.array([-0.05, -0.04]), self.radius)

        assert self.outline.lap_length * 0.98 < progress[0] < self.outline.lap_length

    def test_does_not_jump_across_a_crossover(self) -> None:
        outline = build_outline(*figure_eight())
        # Start away from the crossing itself, then drive through it twice.
        t = np.linspace(0.3, 0.3 + 2 * np.pi, 300, endpoint=False)
        span = TRACK_WORLD_SPAN / (2 * RADIUS_RAW) * RADIUS_RAW
        xs, ys = span * np.sin(t), span * np.sin(t) * np.cos(t)

        progress, _ = match_track(outline, xs, ys, max_step=40.0, track_width=4.0)

        assert np.all(np.diff(progress) > 0)
