"""Extraction of per-driver streams from a loaded FastF1 session.

Every time value returned here is in session seconds (FastF1 SessionTime),
the common axis for positions, telemetry, laps and race-control messages.
"""

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np

from app.models import ReplayMessage

logger = logging.getLogger(__name__)

OFF_TRACK_STATUS = "OffTrack"


def _seconds(series: Any) -> np.ndarray:
    return series.dt.total_seconds().to_numpy(dtype=float)


@dataclass(frozen=True)
class PositionStream:
    times: np.ndarray
    x: np.ndarray
    y: np.ndarray
    off_track: np.ndarray


@dataclass(frozen=True)
class DriverLaps:
    starts: np.ndarray
    ends: np.ndarray
    # Lap time in seconds; NaN for laps without a valid time (deleted, in/out).
    times: np.ndarray
    pit_in: list[float]
    pit_out: list[float]


def position_stream(loaded: Any, number: str) -> PositionStream | None:
    """Raw position samples of one car over the whole session, time-sorted."""
    pos_data = getattr(loaded, "pos_data", None)
    frame = pos_data.get(number) if isinstance(pos_data, dict) else None
    if frame is None or frame.empty:
        return None
    times = _seconds(frame["SessionTime"])
    order = np.argsort(times)
    status = frame["Status"].to_numpy()[order] if "Status" in frame.columns else None
    off_track = (status == OFF_TRACK_STATUS) if status is not None else np.zeros(len(order), bool)
    return PositionStream(
        times=times[order],
        x=frame["X"].to_numpy(dtype=float)[order],
        y=frame["Y"].to_numpy(dtype=float)[order],
        off_track=off_track,
    )


def speed_at(loaded: Any, number: str, sample_times: np.ndarray) -> np.ndarray:
    """Official speed (km/h) from car telemetry at each sample time."""
    car_data = getattr(loaded, "car_data", None)
    frame = car_data.get(number) if isinstance(car_data, dict) else None
    if frame is None or frame.empty or "Speed" not in frame.columns:
        return np.zeros(len(sample_times))
    times = _seconds(frame["SessionTime"])
    order = np.argsort(times)
    return np.interp(sample_times, times[order], frame["Speed"].to_numpy(dtype=float)[order])


def off_track_at(stream: PositionStream, sample_times: np.ndarray) -> np.ndarray:
    """The categorical OnTrack/OffTrack flag held from the previous sample."""
    index = np.clip(np.searchsorted(stream.times, sample_times, side="right") - 1, 0, len(stream.times) - 1)
    return stream.off_track[index]


def _optional_seconds(value: Any) -> float | None:
    seconds = getattr(value, "total_seconds", None)
    if seconds is None:
        return None
    result = float(seconds())
    return None if np.isnan(result) else result


def driver_laps(laps: Any, number: str) -> DriverLaps:
    """Lap boundaries, valid lap times and pit lane entries/exits of one car."""
    own = laps[laps["DriverNumber"] == number]
    deleted = own["Deleted"].fillna(False).to_numpy(dtype=bool) if "Deleted" in own.columns else np.zeros(len(own), bool)
    lap_times = _seconds(own["LapTime"])
    return DriverLaps(
        starts=_seconds(own["LapStartTime"]),
        ends=_seconds(own["Time"]),
        times=np.where(deleted, np.nan, lap_times),
        pit_in=[t for t in map(_optional_seconds, own["PitInTime"]) if t is not None],
        pit_out=[t for t in map(_optional_seconds, own["PitOutTime"]) if t is not None],
    )


def race_start_time(laps: Any) -> float | None:
    """Lights out: the earliest start of lap 1."""
    lap_one = laps[laps["LapNumber"] == 1]["LapStartTime"].dropna()
    return float(lap_one.min().total_seconds()) if len(lap_one) else None


def _message_time(stamp: Any, t0: Any) -> float:
    # Race-control "Time" is a wall-clock timestamp; convert it to session time.
    return float((stamp - t0).total_seconds()) if t0 is not None else float(stamp.total_seconds())


def race_control_messages(loaded: Any, start: float, duration: float) -> list[ReplayMessage]:
    """Flags, safety car and incident messages on the replay clock.

    Best effort: a malformed feed yields no messages rather than no replay.
    """
    import pandas as pd

    try:
        messages = getattr(loaded, "race_control_messages", None)
        if messages is None or messages.empty:
            return []
        t0 = getattr(loaded, "t0_date", None)
        out: list[ReplayMessage] = []
        for _, row in messages.iterrows():
            stamp = row.get("Time")
            if stamp is None or pd.isna(stamp):
                continue
            relative = _message_time(stamp, t0) - start
            if relative < -1.0 or relative > duration + 1.0:
                continue
            flag, scope = row.get("Flag"), row.get("Scope")
            out.append(
                ReplayMessage(
                    time=round(min(max(relative, 0.0), duration), 2),
                    category=str(row.get("Category") or "Other"),
                    message=str(row.get("Message") or "").strip(),
                    flag=flag if isinstance(flag, str) and flag else None,
                    scope=scope if isinstance(scope, str) and scope else None,
                )
            )
        return sorted(out, key=lambda message: message.time)
    except Exception:
        logger.warning("Race control messages unavailable", exc_info=True)
        return []
