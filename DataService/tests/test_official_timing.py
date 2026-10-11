import math
from datetime import timedelta

import numpy as np

from app.replay.official import merge_gaps, merge_positions, parse_gap, step_sample

NAN = math.nan


class TestParseGap:
    def test_reads_gaps_and_the_leader(self) -> None:
        assert [parse_gap("+1.234"), parse_gap("LAP 12"), parse_gap(" +0.5 ")] == [1.234, 0.0, 0.5]

    def test_accepts_already_parsed_timedeltas(self) -> None:
        assert parse_gap(timedelta(seconds=2.5)) == 2.5

    def test_lapped_or_missing_gaps_are_unknown(self) -> None:
        assert all(math.isnan(parse_gap(value)) for value in ("1L", "2 L", "", None, "+x"))


class TestStepSample:
    def test_holds_the_last_value_sent(self) -> None:
        result = step_sample(np.array([10.0, 20.0]), np.array([3.0, 1.0]), np.array([5.0, 10.0, 15.0, 25.0]))

        assert np.array_equal(result, np.array([NAN, 3.0, 3.0, 1.0]), equal_nan=True)

    def test_skips_updates_without_a_value(self) -> None:
        result = step_sample(np.array([10.0, 20.0]), np.array([3.0, NAN]), np.array([25.0]))

        assert result.tolist() == [3.0]


class TestMergePositions:
    def test_follows_the_official_order_over_the_computed_one(self) -> None:
        official = np.array([[2.0], [1.0], [3.0]])
        computed = np.array([[1], [2], [3]])

        assert merge_positions(official, computed)[:, 0].tolist() == [2, 1, 3]

    def test_cars_missing_from_the_feed_go_behind_in_computed_order(self) -> None:
        official = np.array([[NAN], [1.0], [NAN]])
        computed = np.array([[3], [1], [2]])

        assert merge_positions(official, computed)[:, 0].tolist() == [3, 1, 2]

    def test_duplicate_official_positions_still_give_a_unique_order(self) -> None:
        official = np.array([[1.0], [1.0]])
        computed = np.array([[2], [1]])

        assert merge_positions(official, computed)[:, 0].tolist() == [2, 1]


class TestMergeGaps:
    def test_prefers_official_gaps_and_zeroes_the_leader(self) -> None:
        official = np.array([[NAN], [1.5], [NAN]])
        computed = np.array([[0.4], [1.2], [80.0]])
        positions = np.array([[1], [2], [3]])

        assert merge_gaps(official, computed, positions)[:, 0].tolist() == [0.0, 1.5, 80.0]
