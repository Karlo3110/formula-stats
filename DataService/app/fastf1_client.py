"""Thin wrapper over the FastF1 library.

FastF1 calls are blocking (network + parsing), so router handlers that call into
this module are defined as sync `def` functions and run in FastAPI's threadpool.
"""

import os

import fastf1
import pandas as pd

from app.config import get_settings
from app.models import DriverResult, EventSummary, SessionResults

_cache_enabled = False


def _ensure_cache() -> None:
    global _cache_enabled
    if _cache_enabled:
        return
    cache_dir = get_settings().fastf1_cache_dir
    os.makedirs(cache_dir, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
    _cache_enabled = True


def _optional_str(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    return str(value)


def get_event_schedule(season: int) -> list[EventSummary]:
    _ensure_cache()
    schedule = fastf1.get_event_schedule(season, include_testing=False)
    events: list[EventSummary] = []
    for _, row in schedule.iterrows():
        event_date = row.get("EventDate")
        events.append(
            EventSummary(
                round_number=int(row["RoundNumber"]),
                country=str(row["Country"]),
                location=str(row["Location"]),
                event_name=str(row["EventName"]),
                event_date=_optional_str(event_date.isoformat() if event_date is not None and not pd.isna(event_date) else None),
            )
        )
    return events


def get_session_results(season: int, round_number: int, session: str) -> SessionResults:
    _ensure_cache()
    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=False, telemetry=False, weather=False, messages=False)

    results: list[DriverResult] = []
    for _, row in loaded.results.iterrows():
        position = row.get("Position")
        results.append(
            DriverResult(
                position=int(position) if position is not None and not pd.isna(position) else None,
                driver_number=str(row.get("DriverNumber", "")),
                abbreviation=str(row.get("Abbreviation", "")),
                full_name=str(row.get("FullName", "")),
                team_name=str(row.get("TeamName", "")),
                points=float(row.get("Points", 0) or 0),
                status=str(row.get("Status", "")),
            )
        )

    return SessionResults(
        season=season,
        round_number=round_number,
        session=session,
        results=results,
    )
