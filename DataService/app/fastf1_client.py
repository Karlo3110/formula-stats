"""Thin wrapper over the FastF1 library.

FastF1 (and its pandas/numpy/matplotlib stack) is imported lazily inside the
functions, so a heavy or failing import never blocks app startup or the health
endpoints — it surfaces only when an F1 endpoint is actually called.

FastF1 calls are blocking (network + parsing), so router handlers that call into
this module are defined as sync `def` functions and run in FastAPI's threadpool.
"""

import os
from typing import TYPE_CHECKING

from app.config import get_settings
from app.models import (
    ConstructorStandingRow,
    DriverStandingRow,
    EventSummary,
    ReplaySession,
    SeasonStandings,
    SessionResults,
    TrackMap,
    WeekendEvent,
    WeekendSchedule,
    WeekendSession,
)
from app.replay.outline import build_outline
from app.result_mapping import map_driver_result

if TYPE_CHECKING:
    import pandas as pd

_cache_enabled = False


def ensure_cache() -> None:
    global _cache_enabled
    if _cache_enabled:
        return
    import fastf1

    cache_dir = get_settings().fastf1_cache_dir
    os.makedirs(cache_dir, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
    _cache_enabled = True


def _is_missing(value: object) -> bool:
    import pandas as pd

    return value is None or (isinstance(value, float) and pd.isna(value))


class SessionDataUnavailableError(Exception):
    """FastF1 has no lap/position data for the requested session (yet)."""


def fastest_lap_pos(loaded: object) -> "pd.DataFrame":
    """Position samples of the session's fastest lap.

    FastF1's ``load()`` keeps going when telemetry/position data cannot be
    fetched (common for very recent or unpublished sessions) and only raises
    ``DataNotLoadedError`` on access — translate that into our typed error so
    routers can answer 404 instead of crashing with a 500.
    """
    from fastf1.exceptions import DataNotLoadedError

    try:
        fastest = loaded.laps.pick_fastest()  # type: ignore[attr-defined]
        if fastest is None:
            raise SessionDataUnavailableError(
                "No lap data is available for this session yet."
            )
        return fastest.get_pos_data()
    except DataNotLoadedError as exc:
        raise SessionDataUnavailableError(
            "Position data is not available for this session yet."
        ) from exc


def get_event_schedule(season: int) -> list[EventSummary]:
    ensure_cache()
    import fastf1

    schedule = fastf1.get_event_schedule(season, include_testing=False)
    events: list[EventSummary] = []
    for _, row in schedule.iterrows():
        event_date = row.get("EventDate")
        has_date = event_date is not None and not _is_missing(event_date)
        events.append(
            EventSummary(
                round_number=int(row["RoundNumber"]),
                country=str(row["Country"]),
                location=str(row["Location"]),
                event_name=str(row["EventName"]),
                event_date=event_date.isoformat() if has_date else None,
            )
        )
    return events


def get_schedule(season: int) -> WeekendSchedule:
    """Full season schedule with each event's sessions and UTC start times."""
    ensure_cache()
    import fastf1
    import pandas as pd

    schedule = fastf1.get_event_schedule(season, include_testing=False)
    events: list[WeekendEvent] = []
    for _, row in schedule.iterrows():
        sessions: list[WeekendSession] = []
        for i in range(1, 6):
            name = row.get(f"Session{i}")
            date = row.get(f"Session{i}DateUtc")
            if isinstance(name, str) and name and date is not None and not pd.isna(date):
                sessions.append(WeekendSession(name=name, start_utc=date.isoformat()))
        events.append(
            WeekendEvent(
                round_number=int(row["RoundNumber"]),
                country=str(row["Country"]),
                location=str(row["Location"]),
                event_name=str(row["EventName"]),
                sessions=sessions,
            )
        )
    return WeekendSchedule(season=season, events=events)


def get_standings(season: int) -> SeasonStandings:
    """Driver and constructor championship standings (via the Ergast/Jolpica API)."""
    from fastf1.ergast import Ergast

    ergast = Ergast()
    drivers: list[DriverStandingRow] = []
    constructors: list[ConstructorStandingRow] = []

    driver_resp = ergast.get_driver_standings(season=season)
    if driver_resp.content:
        for _, row in driver_resp.content[0].iterrows():
            teams = row.get("constructorNames")
            team = ", ".join(teams) if isinstance(teams, (list, tuple)) else str(teams or "")
            drivers.append(
                DriverStandingRow(
                    position=int(row["position"]),
                    code=str(row.get("driverCode") or ""),
                    given_name=str(row.get("givenName") or ""),
                    family_name=str(row.get("familyName") or ""),
                    team=team,
                    points=float(row.get("points") or 0),
                    wins=int(row.get("wins") or 0),
                )
            )

    constructor_resp = ergast.get_constructor_standings(season=season)
    if constructor_resp.content:
        for _, row in constructor_resp.content[0].iterrows():
            constructors.append(
                ConstructorStandingRow(
                    position=int(row["position"]),
                    name=str(row.get("constructorName") or ""),
                    points=float(row.get("points") or 0),
                    wins=int(row.get("wins") or 0),
                )
            )

    return SeasonStandings(season=season, drivers=drivers, constructors=constructors)


def get_session_results(season: int, round_number: int, session: str) -> SessionResults:
    ensure_cache()
    import fastf1

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=False, telemetry=False, weather=False, messages=False)

    results = [map_driver_result(row) for _, row in loaded.results.iterrows()]

    return SessionResults(
        season=season,
        round_number=round_number,
        session=session,
        results=results,
    )


def get_track_map(season: int, round_number: int, session: str) -> TrackMap:
    ensure_cache()
    import fastf1

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=True, telemetry=True, weather=False, messages=False)

    pos = fastest_lap_pos(loaded)
    outline = build_outline(
        pos["X"].to_numpy(dtype=float),
        pos["Y"].to_numpy(dtype=float),
        pos["Z"].to_numpy(dtype=float) if "Z" in pos.columns else None,
    )

    return TrackMap(
        season=season,
        round_number=round_number,
        session=session,
        track=outline.points(),
    )


def get_replay(season: int, round_number: int, session: str) -> ReplaySession:
    """Whole-session replay (every car, map-matched onto the circuit)."""
    ensure_cache()
    import fastf1

    from app.replay.builder import build_replay

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=True, telemetry=True, weather=False, messages=True)
    replay = build_replay(loaded, season, round_number, session, fastest_lap_pos(loaded))
    if replay is None:
        raise SessionDataUnavailableError("Position data is not available for this session yet.")
    return replay
