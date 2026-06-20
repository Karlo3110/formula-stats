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
from app.models import DriverResult, EventSummary, SessionResults, TrackMap

if TYPE_CHECKING:
    import numpy as np
    import pandas as pd

_cache_enabled = False

TRACK_WORLD_SPAN = 240.0
TRACK_POINTS = 180
TRACK_SMOOTH_WINDOW = 9


def _ensure_cache() -> None:
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


def get_event_schedule(season: int) -> list[EventSummary]:
    _ensure_cache()
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


def get_session_results(season: int, round_number: int, session: str) -> SessionResults:
    _ensure_cache()
    import fastf1

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=False, telemetry=False, weather=False, messages=False)

    results: list[DriverResult] = []
    for _, row in loaded.results.iterrows():
        position = row.get("Position")
        results.append(
            DriverResult(
                position=int(position) if not _is_missing(position) else None,
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


def get_track_map(season: int, round_number: int, session: str) -> TrackMap:
    _ensure_cache()
    import fastf1

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=True, telemetry=True, weather=False, messages=False)

    fastest = loaded.laps.pick_fastest()
    pos = fastest.get_pos_data()

    track = _build_outline(
        pos["X"].to_numpy(dtype=float),
        pos["Y"].to_numpy(dtype=float),
    )

    return TrackMap(
        season=season,
        round_number=round_number,
        session=session,
        track=track,
    )


def _circular_smooth(values: "np.ndarray", window: int) -> "np.ndarray":
    import numpy as np

    if window < 2:
        return values
    padded = np.concatenate([values[-window:], values, values[:window]])
    kernel = np.ones(window) / window
    smoothed = np.convolve(padded, kernel, mode="same")
    return smoothed[window:-window]


def _build_outline(xs: "np.ndarray", ys: "np.ndarray") -> list[list[float]]:
    """Clean a noisy GPS lap into an evenly-spaced, smoothed, normalized loop."""
    import numpy as np

    # Drop consecutive duplicate samples.
    keep = np.concatenate([[True], (np.diff(xs) != 0) | (np.diff(ys) != 0)])
    xs, ys = xs[keep], ys[keep]

    # Resample evenly by arc length so the curve has no clustered points.
    seg = np.sqrt(np.diff(xs) ** 2 + np.diff(ys) ** 2)
    cumulative = np.concatenate([[0.0], np.cumsum(seg)])
    total = float(cumulative[-1])
    if total <= 0:
        return []
    samples = np.linspace(0, total, TRACK_POINTS, endpoint=False)
    xr = np.interp(samples, cumulative, xs)
    yr = np.interp(samples, cumulative, ys)

    # Smooth out telemetry jitter (circular, since the lap is a loop).
    xr = _circular_smooth(xr, TRACK_SMOOTH_WINDOW)
    yr = _circular_smooth(yr, TRACK_SMOOTH_WINDOW)

    center_x = (float(xr.min()) + float(xr.max())) / 2
    center_y = (float(yr.min()) + float(yr.max())) / 2
    span = max(float(xr.max() - xr.min()), float(yr.max() - yr.min())) or 1.0
    scale = TRACK_WORLD_SPAN / span

    return [
        [round((float(x) - center_x) * scale, 2), round((float(y) - center_y) * scale, 2)]
        for x, y in zip(xr, yr)
    ]
