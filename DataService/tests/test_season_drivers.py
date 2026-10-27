from collections.abc import Iterator

from app.models import DriverProfile, SeasonDrivers
from app.season_drivers import pick_driver_list

HEADSHOT = "https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png"


def make_drivers(round_number: int, headshot_url: str | None) -> SeasonDrivers:
    driver = DriverProfile(
        code="VER",
        number="1",
        full_name="Max Verstappen",
        team_name="Red Bull Racing",
        team_color="#3671C6",
        headshot_url=headshot_url,
        country_code="NED",
    )
    return SeasonDrivers(season=2026, round_number=round_number, drivers=[driver])


class TestPickDriverList:
    def test_takes_the_newest_list_when_it_has_headshots(self) -> None:
        picked = pick_driver_list([make_drivers(19, HEADSHOT), make_drivers(18, HEADSHOT)])

        assert picked is not None and picked.round_number == 19

    def test_skips_a_newer_list_without_headshots(self) -> None:
        picked = pick_driver_list([make_drivers(19, None), make_drivers(18, HEADSHOT)])

        assert picked is not None and picked.round_number == 18

    def test_falls_back_to_the_newest_list_when_none_has_headshots(self) -> None:
        picked = pick_driver_list([make_drivers(19, None), make_drivers(18, None)])

        assert picked is not None and picked.round_number == 19

    def test_returns_none_without_candidates(self) -> None:
        assert pick_driver_list([]) is None

    def test_stops_loading_at_the_first_list_with_headshots(self) -> None:
        loaded: list[int] = []

        def candidates() -> Iterator[SeasonDrivers]:
            for round_number in (19, 18, 17):
                loaded.append(round_number)
                yield make_drivers(round_number, HEADSHOT if round_number == 18 else None)

        pick_driver_list(candidates())

        assert loaded == [19, 18]
