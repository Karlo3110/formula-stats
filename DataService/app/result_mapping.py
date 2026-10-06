"""Pure mapping from FastF1 result rows to API models.

Kept free of FastF1/pandas imports so it can be unit-tested with plain dicts.
Rows are pandas Series in production; both support ``.get``.
"""

import math
from collections.abc import Iterable, Mapping
from typing import Any

from app.models import DriverProfile, DriverResult

_HEX_COLOR_LENGTH = 6
_SECURE_URL_PREFIX = "https://"


def _is_blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, float) and math.isnan(value):
        return True
    return isinstance(value, str) and value.strip() in ("", "nan", "None")


def clean_text(value: Any) -> str | None:
    return None if _is_blank(value) else str(value).strip()


def to_int(value: Any) -> int | None:
    if _is_blank(value):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def to_seconds(value: Any) -> float | None:
    """Seconds from a timedelta-like value; None for NaT/missing."""
    total_seconds = getattr(value, "total_seconds", None)
    if total_seconds is None:
        return None
    seconds = float(total_seconds())
    return None if math.isnan(seconds) else round(seconds, 3)


def to_team_color(value: Any) -> str | None:
    """FastF1 team colours are bare hex ("3671C6"); return "#3671c6"."""
    text = clean_text(value)
    if text is None:
        return None
    hex_part = text.lstrip("#")
    is_hex = len(hex_part) == _HEX_COLOR_LENGTH and all(c in "0123456789abcdefABCDEF" for c in hex_part)
    return f"#{hex_part.lower()}" if is_hex else None


def to_secure_url(value: Any) -> str | None:
    """Only absolute HTTPS URLs are passed on to clients."""
    text = clean_text(value)
    return text if text and text.startswith(_SECURE_URL_PREFIX) else None


def map_driver_result(row: Mapping[str, Any]) -> DriverResult:
    position = to_int(row.get("Position"))
    return DriverResult(
        position=position,
        driver_number=str(row.get("DriverNumber", "")),
        abbreviation=str(row.get("Abbreviation", "")),
        full_name=str(row.get("FullName", "")),
        team_name=str(row.get("TeamName", "")),
        points=float(row.get("Points", 0) or 0),
        status=str(row.get("Status", "")),
        grid_position=to_int(row.get("GridPosition")),
        laps=to_int(row.get("Laps")),
        time_seconds=to_seconds(row.get("Time")),
        team_color=to_team_color(row.get("TeamColor")),
        headshot_url=to_secure_url(row.get("HeadshotUrl")),
        country_code=clean_text(row.get("CountryCode")),
    )


def map_driver_profile(row: Mapping[str, Any]) -> DriverProfile | None:
    code = clean_text(row.get("Abbreviation"))
    if code is None:
        return None
    return DriverProfile(
        code=code,
        number=clean_text(row.get("DriverNumber")),
        full_name=clean_text(row.get("FullName")) or code,
        team_name=clean_text(row.get("TeamName")),
        team_color=to_team_color(row.get("TeamColor")),
        headshot_url=to_secure_url(row.get("HeadshotUrl")),
        country_code=clean_text(row.get("CountryCode")),
    )


def map_driver_profiles(rows: Iterable[Mapping[str, Any]]) -> list[DriverProfile]:
    profiles = (map_driver_profile(row) for row in rows)
    return [profile for profile in profiles if profile is not None]
