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
    DriverResult,
    DriverStandingRow,
    EventSummary,
    ReplayDriver,
    ReplayMessage,
    ReplaySession,
    SeasonStandings,
    SessionResults,
    TrackMap,
    WeekendEvent,
    WeekendSchedule,
    WeekendSession,
)

if TYPE_CHECKING:
    import numpy as np
    import pandas as pd

_cache_enabled = False

TRACK_WORLD_SPAN = 240.0
TRACK_POINTS = 220
TRACK_SMOOTH_WINDOW = 5
REPLAY_SAMPLES = 300
REPLAY_RACE_SECONDS = 90.0
REPLAY_PRESTART_SECONDS = 6.0


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


class SessionDataUnavailableError(Exception):
    """FastF1 has no lap/position data for the requested session (yet)."""


def _fastest_lap_pos(loaded: object) -> "pd.DataFrame":
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


def get_schedule(season: int) -> WeekendSchedule:
    """Full season schedule with each event's sessions and UTC start times."""
    _ensure_cache()
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

    pos = _fastest_lap_pos(loaded)

    track = _build_outline(
        pos["X"].to_numpy(dtype=float),
        pos["Y"].to_numpy(dtype=float),
        pos["Z"].to_numpy(dtype=float) if "Z" in pos.columns else None,
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
    xs: "np.ndarray", ys: "np.ndarray", zs: "np.ndarray | None" = None
) -> tuple["np.ndarray", "np.ndarray", "np.ndarray | None"]:
    """Clean a noisy GPS lap into an evenly-spaced, smoothed (un-normalized) loop.

    When a Z (elevation) channel is supplied it is resampled and smoothed onto
    the same arc-length grid so the outline carries real circuit elevation.
    """
    import numpy as np

    keep = np.concatenate([[True], (np.diff(xs) != 0) | (np.diff(ys) != 0)])
    xs, ys = xs[keep], ys[keep]
    if zs is not None:
        zs = zs[keep]

    seg = np.sqrt(np.diff(xs) ** 2 + np.diff(ys) ** 2)
    cumulative = np.concatenate([[0.0], np.cumsum(seg)])
    total = float(cumulative[-1])
    if total <= 0:
        return xs, ys, zs

    samples = np.linspace(0, total, TRACK_POINTS, endpoint=False)
    xr = _circular_smooth(np.interp(samples, cumulative, xs), TRACK_SMOOTH_WINDOW)
    yr = _circular_smooth(np.interp(samples, cumulative, ys), TRACK_SMOOTH_WINDOW)
    zr = (
        _circular_smooth(np.interp(samples, cumulative, zs), TRACK_SMOOTH_WINDOW)
        if zs is not None
        else None
    )
    return xr, yr, zr


def _normalization(xs: "np.ndarray", ys: "np.ndarray") -> tuple[float, float, float]:
    center_x = (float(xs.min()) + float(xs.max())) / 2
    center_y = (float(ys.min()) + float(ys.max())) / 2
    span = max(float(xs.max() - xs.min()), float(ys.max() - ys.min())) or 1.0
    return center_x, center_y, TRACK_WORLD_SPAN / span


def _elevation_ref(
    xr: "np.ndarray", zr: "np.ndarray | None"
) -> tuple[float, "np.ndarray"]:
    """Datum + filled elevation array. Flat (zeros) when Z is missing/constant."""
    import numpy as np

    if zr is None or float(np.ptp(zr)) <= 0:
        return 0.0, np.zeros(len(xr))
    return float(np.min(zr)), zr


def _outline_with_norm(
    xs: "np.ndarray", ys: "np.ndarray", zs: "np.ndarray | None" = None
) -> tuple[list[list[float]], float, float, float, float]:
    """Normalized 3D outline ([x, elevation, y]) plus the shared centering/scale.

    Elevation uses the same horizontal scale and is lifted so the lowest point
    sits at 0, keeping the circuit's real undulation in proportion.
    """
    xr, yr, zr = _clean_resample_smooth(xs, ys, zs)
    cx, cy, scale = _normalization(xr, yr)
    cz, zr = _elevation_ref(xr, zr)
    track = [
        [
            round((float(x) - cx) * scale, 2),
            round((float(z) - cz) * scale, 2),
            round((float(y) - cy) * scale, 2),
        ]
        for x, y, z in zip(xr, yr, zr)
    ]
    return track, cx, cy, cz, scale


def _build_outline(
    xs: "np.ndarray", ys: "np.ndarray", zs: "np.ndarray | None" = None
) -> list[list[float]]:
    track, *_ = _outline_with_norm(xs, ys, zs)
    return track


def _driver_pos(loaded: object, number: str) -> "pd.DataFrame | None":
    """Raw per-driver position stream over the whole session."""
    pos_data = getattr(loaded, "pos_data", None)
    if isinstance(pos_data, dict) and number in pos_data:
        return pos_data[number]
    try:
        return loaded.laps.pick_drivers(number).get_pos_data()  # type: ignore[attr-defined]
    except Exception:
        return None


def _driver_ontrack(
    status: "np.ndarray | None", st: "np.ndarray", grid_abs: "np.ndarray"
) -> "np.ndarray":
    """On-track flag (1.0/0.0) per grid time from the position 'Status' channel.

    Status is categorical ('OnTrack'/'OffTrack'), so it is held with a
    nearest-previous lookup rather than interpolated.
    """
    import numpy as np

    if status is None:
        return np.ones(len(grid_abs))
    idx = np.clip(np.searchsorted(st, grid_abs, side="right") - 1, 0, len(status) - 1)
    return np.array([1.0 if str(status[i]) == "OnTrack" else 0.0 for i in idx])


def _driver_speed(
    car_data: object, number: str, grid_abs: "np.ndarray"
) -> "np.ndarray":
    """Official speed (km/h) from the car telemetry, aligned to the time grid."""
    import numpy as np

    if isinstance(car_data, dict) and number in car_data:
        cdf = car_data[number]
        if cdf is not None and not cdf.empty and "Speed" in cdf.columns:
            cst = cdf["SessionTime"].dt.total_seconds().to_numpy(dtype=float)
            order = np.argsort(cst)
            return np.interp(
                grid_abs, cst[order], cdf["Speed"].to_numpy(dtype=float)[order]
            )
    return np.zeros(len(grid_abs))


def _track_progress(
    xi: "np.ndarray",
    yi: "np.ndarray",
    ox: "np.ndarray",
    oy: "np.ndarray",
    arclen: "np.ndarray",
    lap_length: float,
) -> "np.ndarray":
    """Distance each car has covered along the track (lap*length + arc-length).

    Projects each position onto the nearest track-outline vertex and accumulates
    a lap each time it wraps past start/finish — this is the real on-track order.
    """
    import numpy as np

    d2 = (xi[:, None] - ox[None, :]) ** 2 + (yi[:, None] - oy[None, :]) ** 2
    s = arclen[np.argmin(d2, axis=1)]

    progress = np.empty_like(s)
    offset = 0.0
    progress[0] = s[0]
    for k in range(1, len(s)):
        if s[k] < s[k - 1] - lap_length * 0.5:
            offset += lap_length
        progress[k] = s[k] + offset
    return progress


def _race_start_time(loaded: object) -> "float | None":
    try:
        laps = loaded.laps  # type: ignore[attr-defined]
        lap_one = laps[laps["LapNumber"] == 1]["LapStartTime"].dropna()
        if len(lap_one) > 0:
            return float(lap_one.min().total_seconds())
    except Exception:
        pass
    return None


_HAZARD_FLAGS = {"YELLOW", "DOUBLE YELLOW", "RED"}


def _race_control_messages(
    loaded: object,
    lights_out: "float | None",
    lights_out_rel: float,
    window: float,
    grid_start: float,
) -> list[ReplayMessage]:
    """Race-control messages (flags, safety car, incidents) mapped onto the
    replay clock. Best-effort: any failure yields an empty feed rather than
    breaking the replay.
    """
    import pandas as pd

    try:
        msgs = getattr(loaded, "race_control_messages", None)
        if msgs is None or msgs.empty:
            return []
        t0 = getattr(loaded, "t0_date", None)
        out: list[ReplayMessage] = []
        for _, row in msgs.iterrows():
            stamp = row.get("Time")
            if stamp is None or pd.isna(stamp):
                continue
            # race_control "Time" is an absolute timestamp; convert to seconds
            # from session start (t0_date), the same axis as the position data.
            if t0 is not None:
                secs = float((stamp - t0).total_seconds())
            else:
                secs = float(stamp.total_seconds())
            rel = (
                secs - grid_start
                if lights_out is None
                else lights_out_rel + (secs - lights_out)
            )
            if rel < -1.0 or rel > window + 1.0:
                continue
            flag = row.get("Flag")
            scope = row.get("Scope")
            out.append(
                ReplayMessage(
                    time=round(min(max(rel, 0.0), window), 2),
                    category=str(row.get("Category") or "Other"),
                    message=str(row.get("Message") or "").strip(),
                    flag=str(flag) if isinstance(flag, str) and flag else None,
                    scope=str(scope) if isinstance(scope, str) and scope else None,
                )
            )
        out.sort(key=lambda m: m.time)
        return out
    except Exception:
        return []


def get_replay(season: int, round_number: int, session: str) -> ReplaySession:
    """Session-time-aligned position replay (real wheel-to-wheel racing)."""
    _ensure_cache()
    import fastf1
    import numpy as np

    loaded = fastf1.get_session(season, round_number, session)
    loaded.load(laps=True, telemetry=True, weather=False, messages=True)

    fpos = _fastest_lap_pos(loaded)
    track, cx, cy, cz, scale = _outline_with_norm(
        fpos["X"].to_numpy(dtype=float),
        fpos["Y"].to_numpy(dtype=float),
        fpos["Z"].to_numpy(dtype=float) if "Z" in fpos.columns else None,
    )

    # Scale ribbon + cars to the circuit's real size for consistent proportions
    # on every track (X/Y are 1/10 m, so metres->world = scale * 10).
    world_per_metre = scale * 10
    track_width = max(1.8, min(9.0, 14.0 * world_per_metre))
    car_scale = round(track_width / 2.6, 3)

    car_data = getattr(loaded, "car_data", None)
    streams: dict[str, tuple] = {}
    first_times: list[float] = []
    for number in loaded.drivers:
        df = _driver_pos(loaded, number)
        if df is None or df.empty:
            continue
        st = df["SessionTime"].dt.total_seconds().to_numpy(dtype=float)
        order = np.argsort(st)
        st = st[order]
        xs = df["X"].to_numpy(dtype=float)[order]
        ys = df["Y"].to_numpy(dtype=float)[order]
        zs = (
            df["Z"].to_numpy(dtype=float)[order]
            if "Z" in df.columns
            else np.zeros(len(st))
        )
        status = df["Status"].to_numpy()[order] if "Status" in df.columns else None
        streams[number] = (st, xs, ys, zs, status)
        first_times.append(float(st[0]))

    if not streams:
        return ReplaySession(
            season=season, round_number=round_number, session=session,
            durationSeconds=0.0, lightsOutSeconds=0.0,
            trackWidth=track_width, carScale=car_scale, track=track, drivers=[],
            messages=[],
        )

    lights_out = _race_start_time(loaded)
    if lights_out is None:
        # No reliable start time: begin at the aligned data start, no countdown.
        window = REPLAY_RACE_SECONDS
        grid_abs = np.linspace(max(first_times), max(first_times) + window, REPLAY_SAMPLES)
        grid_rel = np.linspace(0, window, REPLAY_SAMPLES)
        lights_out_rel = 0.0
    else:
        # Hold cars at their real grid positions (sample at lights-out) during the
        # countdown, then play the race — avoids clamping everyone onto one point.
        window = REPLAY_PRESTART_SECONDS + REPLAY_RACE_SECONDS
        pre_count = max(1, round(REPLAY_SAMPLES * REPLAY_PRESTART_SECONDS / window))
        race_count = REPLAY_SAMPLES - pre_count
        grid_abs = np.concatenate([
            np.full(pre_count, lights_out),
            np.linspace(lights_out, lights_out + REPLAY_RACE_SECONDS, race_count),
        ])
        grid_rel = np.linspace(0, window, REPLAY_SAMPLES)
        lights_out_rel = REPLAY_PRESTART_SECONDS

    # Pass 1: normalized positions (+ elevation), official speed, on-track flag.
    built: list[dict] = []
    for number, (st, xs, ys, zs, status) in streams.items():
        info = loaded.get_driver(number)
        team_color = info.get("TeamColor")
        built.append({
            "xi": (np.interp(grid_abs, st, xs) - cx) * scale,
            "yi": (np.interp(grid_abs, st, ys) - cy) * scale,
            "zi": (np.interp(grid_abs, st, zs) - cz) * scale,
            "speed": _driver_speed(car_data, number, grid_abs),
            "ontrack": _driver_ontrack(status, st, grid_abs),
            "code": str(info.get("Abbreviation") or number),
            "team": str(info.get("TeamName") or ""),
            "color": f"#{team_color}" if team_color else None,
        })

    # Track progress (lap + arc-length) per driver → true on-track order.
    ox = np.array([p[0] for p in track])
    oy = np.array([p[1] for p in track])
    seg = np.sqrt(np.diff(ox) ** 2 + np.diff(oy) ** 2)
    arclen = np.concatenate([[0.0], np.cumsum(seg)])
    lap_length = float(arclen[-1] + np.hypot(ox[0] - ox[-1], oy[0] - oy[-1]))

    progress = np.vstack(
        [_track_progress(b["xi"], b["yi"], ox, oy, arclen, lap_length) for b in built]
    )
    # Position 1..N per sample: rank by progress (furthest along = leader).
    ranks = np.argsort(np.argsort(-progress, axis=0), axis=0) + 1

    drivers: list[ReplayDriver] = []
    for d, b in enumerate(built):
        # Sample layout: [t, x, y, elevation, speed, position, progress, onTrack]
        samples = [
            [
                round(float(grid_rel[i]), 2),
                round(float(b["xi"][i]), 2),
                round(float(b["yi"][i]), 2),
                round(float(b["zi"][i]), 2),
                round(float(b["speed"][i]), 1),
                int(ranks[d, i]),
                round(float(progress[d, i]), 2),
                int(b["ontrack"][i]),
            ]
            for i in range(REPLAY_SAMPLES)
        ]
        drivers.append(
            ReplayDriver(
                code=b["code"],
                team=b["team"],
                color=b["color"],
                samples=samples,
            )
        )

    messages = _race_control_messages(
        loaded, lights_out, lights_out_rel, float(window), float(grid_abs[0])
    )

    return ReplaySession(
        season=season,
        round_number=round_number,
        session=session,
        durationSeconds=float(window),
        lightsOutSeconds=float(lights_out_rel),
        trackWidth=round(track_width, 2),
        carScale=car_scale,
        track=track,
        drivers=drivers,
        messages=messages,
    )
