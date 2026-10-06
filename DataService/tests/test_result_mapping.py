import math

import pandas as pd
import pytest

from app.result_mapping import (
    map_driver_profile,
    map_driver_profiles,
    map_driver_result,
    to_secure_url,
    to_team_color,
)

HEADSHOT = "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png"


def make_row(**overrides: object) -> pd.Series:
    row = {
        "Position": 1.0,
        "DriverNumber": "4",
        "Abbreviation": "NOR",
        "FullName": "Lando Norris",
        "TeamName": "McLaren",
        "Points": 25.0,
        "Status": "Finished",
        "GridPosition": 2.0,
        "Laps": 57.0,
        "Time": pd.Timedelta(seconds=5504.742),
        "TeamColor": "FF8000",
        "HeadshotUrl": HEADSHOT,
        "CountryCode": "GBR",
    }
    row.update(overrides)
    return pd.Series(row)


class TestMapDriverResult:
    def test_maps_classification_and_enrichment_fields(self) -> None:
        result = map_driver_result(make_row())

        assert (result.position, result.grid_position, result.laps, result.team_color, result.country_code) == (
            1,
            2,
            57,
            "#ff8000",
            "GBR",
        )

    def test_converts_total_race_time_to_seconds(self) -> None:
        assert map_driver_result(make_row()).time_seconds == pytest.approx(5504.742)

    def test_lapped_driver_without_time_has_no_time(self) -> None:
        assert map_driver_result(make_row(Time=pd.NaT)).time_seconds is None

    def test_unclassified_driver_has_no_position(self) -> None:
        result = map_driver_result(make_row(Position=math.nan, GridPosition=math.nan))

        assert (result.position, result.grid_position) == (None, None)

    def test_missing_enrichment_columns_default_to_none(self) -> None:
        row = make_row().drop(["GridPosition", "Laps", "Time", "TeamColor", "HeadshotUrl", "CountryCode"])

        result = map_driver_result(row)

        assert (result.grid_position, result.headshot_url, result.country_code) == (None, None, None)


class TestToSecureUrl:
    def test_keeps_https_headshots(self) -> None:
        assert to_secure_url(HEADSHOT) == HEADSHOT

    @pytest.mark.parametrize("value", ["http://example.com/a.png", "javascript:alert(1)", "", None, math.nan])
    def test_rejects_insecure_or_missing_urls(self, value: object) -> None:
        assert to_secure_url(value) is None


class TestToTeamColor:
    def test_normalises_bare_hex(self) -> None:
        assert to_team_color("3671C6") == "#3671c6"

    @pytest.mark.parametrize("value", ["nan", "", "zzzzzz", "12345", None])
    def test_rejects_invalid_colours(self, value: object) -> None:
        assert to_team_color(value) is None


class TestMapDriverProfiles:
    def test_builds_profiles_and_skips_rows_without_a_code(self) -> None:
        profiles = map_driver_profiles([make_row(), make_row(Abbreviation=math.nan)])

        assert [profile.code for profile in profiles] == ["NOR"]

    def test_profile_carries_image_and_nationality(self) -> None:
        profile = map_driver_profile(make_row())

        assert profile is not None
        assert (profile.number, profile.headshot_url, profile.country_code) == ("4", HEADSHOT, "GBR")
