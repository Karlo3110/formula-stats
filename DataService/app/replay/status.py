"""Per-sample car status on the replay clock (pure numpy)."""

import numpy as np

RUNNING = 0
IN_PIT = 1
OUT = 2


def pit_windows(
    pit_in: list[float],
    pit_out: list[float],
) -> list[tuple[float, float]]:
    """Intervals a car spends in the pit lane or garage.

    `pit_out` holds the session times the car left the pits (start of each
    stint); `pit_in` the times it came in. Before its first exit and after its
    last entry the car is in the garage.
    """
    exits = sorted(pit_out)
    entries = sorted(pit_in)
    windows: list[tuple[float, float]] = []
    if exits and (not entries or exits[0] < entries[0]):
        windows.append((-np.inf, exits[0]))
    for entry in entries:
        following = [t for t in exits if t > entry]
        windows.append((entry, following[0] if following else np.inf))
    return windows


def status_track(
    times: np.ndarray,
    windows: list[tuple[float, float]],
    off_track: np.ndarray,
    retired_after: float | None,
) -> np.ndarray:
    """RUNNING / IN_PIT / OUT for every sample time."""
    status = np.full(len(times), RUNNING, dtype=np.int8)
    for start, end in windows:
        status[(times >= start) & (times <= end)] = IN_PIT
    status[off_track] = IN_PIT
    if retired_after is not None:
        status[times > retired_after] = OUT
    return status
