"""Which part of a session the replay covers, and how densely it is sampled."""

from dataclasses import dataclass
from typing import Literal

import numpy as np

SessionKind = Literal["race", "qualifying", "practice"]

RACE_SESSIONS = {"race", "sprint"}
QUALIFYING_SESSIONS = {"qualifying", "sprint qualifying", "sprint shootout"}

# Grid before lights out, and run-out after the last lap is completed.
RACE_PRESTART_SECONDS = 10.0
SESSION_LEAD_SECONDS = 30.0
SESSION_TAIL_SECONDS = 30.0
SAMPLE_INTERVAL_SECONDS = 1.0
MAX_SAMPLES = 12_000


def session_kind(session_name: str) -> SessionKind:
    name = session_name.strip().lower()
    if name in RACE_SESSIONS:
        return "race"
    if name in QUALIFYING_SESSIONS:
        return "qualifying"
    return "practice"


@dataclass(frozen=True)
class ReplayWindow:
    start: float
    end: float
    lights_out: float | None
    interval: float

    @property
    def duration(self) -> float:
        return self.end - self.start

    def sample_times(self) -> np.ndarray:
        """Absolute session times of every replay sample."""
        return np.arange(self.start, self.end + self.interval / 2, self.interval)


def replay_window(
    kind: SessionKind,
    lap_starts: np.ndarray,
    lap_ends: np.ndarray,
    race_start: float | None,
) -> ReplayWindow:
    """Whole session: lights out to the last lap for races, first car out to
    last lap in for qualifying and practice. Times are session seconds."""
    last_lap_end = float(np.nanmax(lap_ends))
    if kind == "race" and race_start is not None:
        start = race_start - RACE_PRESTART_SECONDS
        lights_out = race_start
    else:
        start = float(np.nanmin(lap_starts)) - SESSION_LEAD_SECONDS
        lights_out = None
    end = last_lap_end + SESSION_TAIL_SECONDS
    interval = max(SAMPLE_INTERVAL_SECONDS, (end - start) / MAX_SAMPLES)
    return ReplayWindow(start=start, end=end, lights_out=lights_out, interval=interval)
