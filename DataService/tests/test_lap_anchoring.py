import numpy as np

from app.replay.matching import anchor_to_laps

LAP = 1000.0
TIMES = np.arange(0.0, 301.0)


def steady_progress(start: float) -> np.ndarray:
    """A car doing one lap every 100 s from `start` metres."""
    return start + TIMES * (LAP / 100.0)


class TestAnchorToLaps:
    def test_keeps_a_car_whose_laps_already_line_up(self) -> None:
        progress = steady_progress(-20.0)
        ends = np.array([102.0, 202.0])  # progress reaches 1 and 2 laps there

        result = anchor_to_laps(progress, TIMES, ends, np.array([1.0, 2.0]), LAP)

        assert np.allclose(result, progress)

    def test_pulls_back_a_car_matched_one_lap_ahead(self) -> None:
        # Starts just past the timing line but was matched as lap 0 = 980 m.
        progress = steady_progress(LAP - 20.0)
        ends = np.array([102.0, 202.0])

        result = anchor_to_laps(progress, TIMES, ends, np.array([1.0, 2.0]), LAP)

        assert result[0] == -20.0

    def test_ignores_laps_outside_the_replay(self) -> None:
        progress = steady_progress(0.0)

        result = anchor_to_laps(progress, TIMES, np.array([np.nan, 900.0]), np.array([1.0, 9.0]), LAP)

        assert np.allclose(result, progress)
