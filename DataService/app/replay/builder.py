"""Builds a full-session replay from a loaded FastF1 session."""

from dataclasses import dataclass
from typing import Any

import numpy as np

from app.models import ReplayDriver, ReplaySession
from app.replay.matching import match_track
from app.replay.outline import Outline, build_outline
from app.replay.sources import (
    DriverLaps,
    driver_laps,
    off_track_at,
    position_stream,
    race_control_messages,
    race_start_time,
    speed_at,
)
from app.replay.status import OUT, RUNNING, pit_windows, status_track
from app.replay.timing import best_lap_order, best_lap_so_far, race_gaps, race_positions
from app.replay.window import ReplayWindow, SessionKind, replay_window, session_kind

# Real circuits are ~12-15 m wide; FastF1 X/Y are 1/10 m.
TRACK_WIDTH_METRES = 14.0
MIN_TRACK_WIDTH, MAX_TRACK_WIDTH = 1.8, 9.0
MAX_SPEED_MPS = 100.0
# Running cars are kept on the drawn road; pit-lane cars keep their offset.
ROAD_LATERAL_LIMIT = 0.45
PIT_LATERAL_LIMIT = 12.0
FINISHED_STATUSES = ("Finished", "Lapped")


@dataclass(frozen=True)
class CarTrack:
    number: str
    progress: np.ndarray
    lateral: np.ndarray
    speed: np.ndarray
    status: np.ndarray
    laps: DriverLaps


def _is_finisher(status: str) -> bool:
    status = status.strip()
    return status in FINISHED_STATUSES or status.startswith("+")


def _retired_after(loaded: Any, number: str, laps: DriverLaps, kind: SessionKind) -> float | None:
    """Race only: a non-finisher is out once their last lap has ended."""
    if kind != "race" or laps.ends.size == 0:
        return None
    try:
        status = str(loaded.results.loc[number, "Status"])
    except (KeyError, AttributeError):
        return None
    return None if _is_finisher(status) else float(np.nanmax(laps.ends))


def _clamp_lateral(lateral: np.ndarray, status: np.ndarray, track_width: float) -> np.ndarray:
    road = ROAD_LATERAL_LIMIT * track_width
    pit = PIT_LATERAL_LIMIT * track_width
    return np.where(status == RUNNING, np.clip(lateral, -road, road), np.clip(lateral, -pit, pit))


def _build_car(
    loaded: Any, number: str, outline: Outline, window: ReplayWindow, kind: SessionKind, track_width: float
) -> CarTrack | None:
    stream = position_stream(loaded, number)
    laps = driver_laps(loaded.laps, number)
    if stream is None or laps.ends.size == 0:
        return None
    times = window.sample_times()
    wx, wy = outline.to_world(np.interp(times, stream.times, stream.x), np.interp(times, stream.times, stream.y))
    max_step = MAX_SPEED_MPS * outline.scale * 10 * window.interval
    progress, lateral = match_track(outline, wx, wy, max_step, track_width)
    status = status_track(
        times,
        pit_windows(laps.pit_in, laps.pit_out),
        off_track_at(stream, times),
        _retired_after(loaded, number, laps, kind),
    )
    return CarTrack(
        number=number,
        progress=progress,
        lateral=_clamp_lateral(lateral, status, track_width),
        speed=speed_at(loaded, number, times),
        status=status,
        laps=laps,
    )


def _order_and_gaps(cars: list[CarTrack], window: ReplayWindow, kind: SessionKind) -> tuple[np.ndarray, np.ndarray]:
    times = window.sample_times()
    if kind == "race":
        progress = np.vstack([car.progress for car in cars])
        start_index = int(np.searchsorted(times, window.lights_out or times[0]))
        gaps = race_gaps(progress, times, start_index)
        statuses = np.vstack([car.status for car in cars])
        return race_positions(progress), np.where(statuses == OUT, np.nan, gaps)
    best = np.vstack([best_lap_so_far(car.laps.ends, car.laps.times, times) for car in cars])
    return best_lap_order(best)


def _nullable(values: np.ndarray, decimals: int) -> list[float | None]:
    return [None if np.isnan(v) else round(float(v), decimals) for v in values]


def _lap_list(laps: DriverLaps, window: ReplayWindow) -> list[list[float | None]]:
    rows = []
    for end, lap_time in sorted(zip(laps.ends, laps.times)):
        if np.isnan(end) or not window.start <= end <= window.end:
            continue
        rows.append([round(float(end - window.start), 2), None if np.isnan(lap_time) else round(float(lap_time), 3)])
    return rows


def _driver_payload(loaded: Any, car: CarTrack, position: np.ndarray, gap: np.ndarray, window: ReplayWindow) -> ReplayDriver:
    info = loaded.get_driver(car.number)
    team_color = info.get("TeamColor")
    return ReplayDriver(
        code=str(info.get("Abbreviation") or car.number),
        number=car.number,
        team=str(info.get("TeamName") or ""),
        color=f"#{team_color}" if isinstance(team_color, str) and team_color else None,
        progress=np.round(car.progress, 1).tolist(),
        lateral=np.round(car.lateral, 2).tolist(),
        speed=np.round(car.speed).astype(int).tolist(),
        position=position.astype(int).tolist(),
        gap=_nullable(gap, 3),
        status=car.status.astype(int).tolist(),
        laps=_lap_list(car.laps, window),
    )


def build_replay(loaded: Any, season: int, round_number: int, session: str, fastest_lap: Any) -> ReplaySession | None:
    """Replay of the whole session, or None when no car has usable data."""
    outline = build_outline(
        fastest_lap["X"].to_numpy(dtype=float),
        fastest_lap["Y"].to_numpy(dtype=float),
        fastest_lap["Z"].to_numpy(dtype=float) if "Z" in fastest_lap.columns else None,
    )
    track_width = float(np.clip(TRACK_WIDTH_METRES * outline.scale * 10, MIN_TRACK_WIDTH, MAX_TRACK_WIDTH))
    kind = session_kind(str(loaded.name))
    laps = loaded.laps
    window = replay_window(
        kind,
        laps["LapStartTime"].dt.total_seconds().to_numpy(dtype=float),
        laps["Time"].dt.total_seconds().to_numpy(dtype=float),
        race_start_time(laps) if kind == "race" else None,
    )
    cars = [car for number in loaded.drivers if (car := _build_car(loaded, number, outline, window, kind, track_width))]
    if not cars:
        return None
    positions, gaps = _order_and_gaps(cars, window, kind)
    total_laps = getattr(loaded, "total_laps", None) if kind == "race" else None
    return ReplaySession(
        season=season,
        round_number=round_number,
        session=session,
        sessionName=str(loaded.name),
        sessionKind=kind,
        durationSeconds=round(window.duration, 2),
        sampleInterval=round(window.interval, 4),
        lightsOutSeconds=round(window.lights_out - window.start, 2) if window.lights_out is not None else None,
        totalLaps=int(total_laps) if total_laps else None,
        trackWidth=round(track_width, 3),
        lapLength=round(outline.lap_length, 3),
        track=outline.points(),
        drivers=[_driver_payload(loaded, car, positions[i], gaps[i], window) for i, car in enumerate(cars)],
        messages=race_control_messages(loaded, window.start, window.duration),
    )
