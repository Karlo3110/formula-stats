import numpy as np
import pytest

from app.replay.builder import build_replay
from app.replay.status import IN_PIT, OUT, RUNNING
from app.replay.window import RACE_PRESTART_SECONDS
from tests.fake_session import LIGHTS_OUT, PIT_STOP_SECONDS, make_race


@pytest.fixture(scope="module")
def race():
    session = make_race(drivers=6, laps=3)
    replay = build_replay(session, 2026, 14, "R", session.fastest_lap)
    assert replay is not None
    return session, replay


def driver(replay, number: str):
    return next(d for d in replay.drivers if d.number == number)


class TestRaceReplay:
    def test_covers_the_whole_race_not_a_fixed_clip(self, race) -> None:
        session, replay = race
        last_lap_end = session.laps["Time"].max().total_seconds()

        assert replay.durationSeconds > last_lap_end - LIGHTS_OUT
        assert replay.lightsOutSeconds == pytest.approx(RACE_PRESTART_SECONDS)

    def test_every_array_has_one_value_per_sample(self, race) -> None:
        _, replay = race
        samples = len(driver(replay, "1").progress)

        assert samples == pytest.approx(replay.durationSeconds / replay.sampleInterval, abs=2)
        for d in replay.drivers:
            assert {len(d.progress), len(d.lateral), len(d.speed), len(d.position), len(d.gap), len(d.status)} == {samples}

    def test_running_cars_stay_on_the_drawn_road(self, race) -> None:
        _, replay = race
        for d in replay.drivers:
            lateral = np.array(d.lateral)[np.array(d.status) == RUNNING]
            assert np.abs(lateral).max() <= 0.45 * replay.trackWidth + 1e-6

    def test_race_distance_matches_the_laps_driven(self, race) -> None:
        _, replay = race
        winner = driver(replay, "1")

        assert winner.progress[-1] - winner.progress[0] == pytest.approx(3 * replay.lapLength, rel=0.02)

    def test_fastest_car_wins_and_retiree_ends_last(self, race) -> None:
        session, replay = race
        finishing = {d.number: d.position[-1] for d in replay.drivers}

        assert finishing["1"] == 1
        assert finishing[session.drivers[-1]] == len(session.drivers)

    def test_retired_car_is_out_and_has_no_gap(self, race) -> None:
        session, replay = race
        retiree = driver(replay, session.drivers[-1])

        assert retiree.status[-1] == OUT and retiree.gap[-1] is None

    def test_pit_stop_is_flagged_for_its_duration(self, race) -> None:
        _, replay = race
        pitting = driver(replay, "4")
        seconds_in_pit = pitting.status.count(IN_PIT) * replay.sampleInterval

        assert seconds_in_pit == pytest.approx(PIT_STOP_SECONDS, abs=4)

    def test_completed_laps_are_listed_on_the_replay_clock(self, race) -> None:
        _, replay = race
        laps = driver(replay, "1").laps

        assert len(laps) == 3 and all(0 < end <= replay.durationSeconds for end, _ in laps)

    def test_race_control_messages_are_on_the_replay_clock(self, race) -> None:
        _, replay = race

        assert replay.messages[1].time == pytest.approx(RACE_PRESTART_SECONDS + 40, abs=0.1)


def test_qualifying_orders_by_best_lap() -> None:
    session = make_race(drivers=4, laps=3, name="Qualifying")

    replay = build_replay(session, 2026, 14, "Q", session.fastest_lap)

    assert replay is not None and replay.sessionKind == "qualifying" and replay.lightsOutSeconds is None
    fastest = min(replay.drivers, key=lambda d: min(t for _, t in d.laps if t is not None))
    assert fastest.position[-1] == 1 and fastest.gap[-1] == 0.0
