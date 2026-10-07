import numpy as np
import pytest

from app.replay.status import IN_PIT, OUT, RUNNING, pit_windows, status_track
from app.replay.timing import (
    best_lap_order,
    best_lap_so_far,
    freeze_after_finish,
    race_gaps,
    race_order_keys,
    race_positions,
)
from app.replay.window import RACE_PRESTART_SECONDS, replay_window, session_kind

TIMES = np.arange(0.0, 11.0)


class TestRaceOrderAndGaps:
    def order(self, progress: np.ndarray, finish_times: list[float | None] | None = None) -> list[int]:
        finish = finish_times or [None] * len(progress)
        return race_positions(race_order_keys(progress, TIMES, finish, lap_length=50.0))[:, -1].tolist()

    def test_furthest_car_leads(self) -> None:
        assert self.order(np.array([TIMES * 10.0, TIMES * 10.0 + 5.0])) == [2, 1]

    def test_backward_gps_wobble_does_not_cost_places(self) -> None:
        progress = np.array([TIMES * 1.0, TIMES * 1.0 - 1.5])
        progress[0, -1] = progress[0, -2] - 1.0  # leader matched backwards

        assert self.order(progress) == [1, 2]

    def test_finishers_are_classified_by_who_crossed_the_line_first(self) -> None:
        # Both take the flag after 2 crossings (progress 100); the first to
        # finish then stops early, the second rolls further on its cool-down.
        first = np.minimum(TIMES * 20.0, 100.0)
        second = np.minimum(TIMES * 14.0, 140.0)

        assert self.order(np.array([first, second]), finish_times=[5.0, 7.15]) == [1, 2]

    def test_finish_gap_is_held_through_the_cool_down_lap(self) -> None:
        gaps = np.array([[0.0] * 11, np.arange(11.0)])

        frozen = freeze_after_finish(gaps, TIMES, [None, 6.0])

        assert frozen[1, -1] == 6.0

    def test_gap_is_time_since_the_leader_passed_the_same_point(self) -> None:
        leader = TIMES * 10.0
        chaser = np.clip(TIMES - 2.0, 0, None) * 10.0  # same pace, 2 s later

        gaps = race_gaps(np.array([leader, chaser]), TIMES, start_index=0)

        assert gaps[:, -1] == pytest.approx([0.0, 2.0])

    def test_no_gap_before_the_start(self) -> None:
        gaps = race_gaps(np.array([TIMES, TIMES]), TIMES, start_index=5)

        assert np.isnan(gaps[:, 4]).all() and not np.isnan(gaps[:, 5]).any()


class TestBestLapOrder:
    def test_best_lap_only_counts_once_completed(self) -> None:
        best = best_lap_so_far(np.array([3.0, 8.0]), np.array([90.0, 88.5]), TIMES)

        assert [best[2], best[3], best[8]] == [pytest.approx(np.nan, nan_ok=True), 90.0, 88.5]

    def test_deleted_laps_are_ignored(self) -> None:
        best = best_lap_so_far(np.array([3.0, 8.0]), np.array([90.0, np.nan]), TIMES)

        assert best[-1] == 90.0

    def test_orders_by_best_lap_with_no_time_last(self) -> None:
        best = np.array([[np.nan], [80.2], [80.0]])

        positions, gaps = best_lap_order(best)

        assert positions[:, 0].tolist() == [3, 2, 1]
        assert gaps[1, 0] == pytest.approx(0.2) and np.isnan(gaps[0, 0])


class TestStatus:
    def test_garage_before_first_run_and_after_last(self) -> None:
        windows = pit_windows(pit_in=[7.0], pit_out=[2.0])

        status = status_track(TIMES, windows, np.zeros(len(TIMES), bool), None)

        assert status.tolist() == [IN_PIT] * 3 + [RUNNING] * 4 + [IN_PIT] * 4

    def test_pit_stop_window_between_entry_and_exit(self) -> None:
        windows = pit_windows(pit_in=[4.0], pit_out=[6.0])

        assert windows == [(4.0, 6.0)]

    def test_retired_car_is_out_after_its_last_lap(self) -> None:
        status = status_track(TIMES, [], np.zeros(len(TIMES), bool), retired_after=8.0)

        assert status[-1] == OUT and status[8] == RUNNING


class TestWindow:
    def test_race_starts_just_before_lights_out(self) -> None:
        window = replay_window("race", np.array([100.0]), np.array([5000.0]), race_start=100.0)

        assert (window.start, window.lights_out) == (100.0 - RACE_PRESTART_SECONDS, 100.0)

    def test_practice_covers_first_run_to_last_lap(self) -> None:
        window = replay_window("practice", np.array([500.0, 900.0]), np.array([3600.0]), race_start=None)

        assert window.lights_out is None
        assert window.start < 500.0
        assert window.end > 3600.0

    def test_very_long_sessions_are_sampled_more_sparsely(self) -> None:
        window = replay_window("race", np.array([0.0]), np.array([3 * 3600 * 2.0]), race_start=0.0)

        assert window.interval > 1.0 and len(window.sample_times()) <= 12_001

    @pytest.mark.parametrize(
        ("name", "kind"),
        [("Race", "race"), ("Sprint", "race"), ("Sprint Qualifying", "qualifying"), ("Practice 2", "practice")],
    )
    def test_session_kinds(self, name: str, kind: str) -> None:
        assert session_kind(name) == kind
