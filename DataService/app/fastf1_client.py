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
    DriverResult,
    EventSummary,
    ReplayDriver,
    ReplaySession,
    SessionResults,
    TrackMap,
)

if TYPE_CHECKING:
    import numpy as np
    import pandas as pd

_cache_enabled = False

TRACK_WORLD_SPAN = 240.0
TRACK_POINTS = 180
TRACK_SMOOTH_WINDOW = 9
REPLAY_SAMPLES = 200
REPLAY_WINDOW_SECONDS = 100.0


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


def _clean_resample_smooth(
    xs: "np.ndarray", ys: "np.ndarray"
) -> tuple["np.ndarray", "np.ndarray"]:
    """Clean a noisy GPS lap into an evenly-spaced, smoothed (un-normalized) loop."""
    import numpy as np

    keep = np.concatenate([[True], (np.diff(xs) != 0) | (np.diff(ys) != 0)])
    xs, ys = xs[keep], ys[keep]

    seg = np.sqrt(np.diff(xs) ** 2 + np.diff(ys) ** 2)
    cumulative = np.concatenate([[0.0], np.cumsum(seg)])
    total = float(cumulative[-1])
    if total <= 0:
        return xs, ys

    samples = np.linspace(0, total, TRACK_POINTS, endpoint=False)
    xr = np.interp(samples, cumulative, xs)
    yr = np.interp(samples, cumulative, ys)
    return (
        _circular_smooth(xr, TRACK_SMOOTH_WINDOW),
        _circular_smooth(yr, TRACK_SMOOTH_WINDOW),
    )


def _normalization(xs: "np.ndarray", ys: "np.ndarray") -> tuple[float, float, float]:
    center_x = (float(xs.min()) + float(xs.max())) / 2
    center_y = (float(ys.min()) + float(ys.max())) / 2
    span = max(float(xs.max() - xs.min()), float(ys.max() - ys.min())) or 1.0
    return center_x, center_y, TRACK_WORLD_SPAN / span


def _build_outline(xs: "np.ndarray", ys: "np.ndarray") -> list[list[float]]:
    xr, yr = _clean_resample_smooth(xs, ys)
    cx, cy, scale = _normalization(xr, yr)
    return [
        [round((float(x) - cx) * scale, 2), round((float(y) - cy) * scale, 2)]
        for x, y in zip(xr, yr)
    ]


def _driver_pos(loaded: object, number: str) -> "pd.DataFrame | None":
    """Raw per-driver position stream over the whole session."""
    pos_data = getattr(loaded, "pos_data", None)
    if isinstance(pos_data, dict) and number in pos_data:
        return pos_data[number]
    try:
        return loaded.laps.pick_drivers(number).get_pos_data()  # type: ignore[attr-defined]
    except Exception:
        return None


def _race_start_time(loaded: object) -> "float | None":
    try:
        laps = loaded.laps  # type: ignore[attr-defined]
        lap_one = laps[laps["LapNumber"] == 1]["LapStartTime"].dropna()
        if len(lap_one) > 0:
            return float(lap_one.min().total_seconds())
    except Exception:
        pass
    return None


def get_replay(season: int, round_number: int, session: str) -> ReplaySession:
    """Session-time-aligned position replay (real wheel-to-wheel racing)."""
    _ensure_cache()
    import fastf1
    import numpy as np

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=True, telemetry=True, weather=False, messages=False)

    fastest = loaded.laps.pick_fastest()
    fpos = fastest.get_pos_data()
    outline_x, outline_y = _clean_resample_smooth(
        fpos["X"].to_numpy(dtype=float), fpos["Y"].to_numpy(dtype=float)
    )
    cx, cy, scale = _normalization(outline_x, outline_y)
    track = [
        [round((float(x) - cx) * scale, 2), round((float(y) - cy) * scale, 2)]
        for x, y in zip(outline_x, outline_y)
    ]

    streams: dict[str, tuple] = {}
    first_times: list[float] = []
    for number in loaded.drivers:
        df = _driver_pos(loaded, number)
        if df is None or df.empty:
            continue
        st = df["SessionTime"].dt.total_seconds().to_numpy(dtype=float)
        order = np.argsort(st)
        streams[number] = (
            st[order],
            df["X"].to_numpy(dtype=float)[order],
            df["Y"].to_numpy(dtype=float)[order],
        )
        first_times.append(float(st[order][0]))

    if not streams:
        return ReplaySession(
            season=season, round_number=round_number, session=session,
            durationSeconds=0.0, track=track, drivers=[],
        )

    start = _race_start_time(loaded)
    if start is None:
        start = max(first_times)
    grid_abs = np.linspace(start, start + REPLAY_WINDOW_SECONDS, REPLAY_SAMPLES)
    grid_rel = np.linspace(0, REPLAY_WINDOW_SECONDS, REPLAY_SAMPLES)

    drivers: list[ReplayDriver] = []
    for number, (st, xs, ys) in streams.items():
        xi = (np.interp(grid_abs, st, xs) - cx) * scale
        yi = (np.interp(grid_abs, st, ys) - cy) * scale
        info = loaded.get_driver(number)
        team_color = info.get("TeamColor")
        samples = [
            [round(float(grid_rel[i]), 2), round(float(xi[i]), 2), round(float(yi[i]), 2)]
            for i in range(REPLAY_SAMPLES)
        ]
        drivers.append(
            ReplayDriver(
                code=str(info.get("Abbreviation") or number),
                team=str(info.get("TeamName") or ""),
                color=f"#{team_color}" if team_color else None,
                samples=samples,
            )
        )

    return ReplaySession(
        season=season,
        round_number=round_number,
        session=session,
        durationSeconds=float(REPLAY_WINDOW_SECONDS),
        track=track,
        drivers=drivers,
    )
