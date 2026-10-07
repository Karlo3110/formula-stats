"""Running order and gaps on the replay clock (pure numpy).

Arrays are shaped (drivers, samples). NaN means "no value" (no gap yet, no
lap time set) and becomes null in the payload.
"""

import numpy as np


def _ranks(keys: np.ndarray) -> np.ndarray:
    """1-based rank per column, smallest key first, ties by driver index."""
    order = np.argsort(keys, axis=0, kind="stable")
    ranks = np.empty_like(order)
    columns = np.arange(keys.shape[1])
    ranks[order, columns] = np.arange(1, keys.shape[0] + 1)[:, None]
    return ranks


def race_positions(progress: np.ndarray) -> np.ndarray:
    """Race order: furthest along the race distance leads.

    Progress is made non-decreasing per driver first, so a car briefly
    matched backwards (GPS noise, pit lane) does not lose places.
    """
    reached = np.maximum.accumulate(progress, axis=1)
    return _ranks(-reached)


def race_gaps(progress: np.ndarray, times: np.ndarray, start_index: int) -> np.ndarray:
    """Time gap to the leader, as timing screens measure it.

    For each car: the current time minus the moment the current leader passed
    the point on track where this car is now. NaN before the start.
    """
    reached = np.maximum.accumulate(progress, axis=1)
    leaders = np.argmax(reached, axis=0)
    gaps = np.full(progress.shape, np.nan)
    for leader in np.unique(leaders):
        columns = np.where((leaders == leader) & (np.arange(len(times)) >= start_index))[0]
        if columns.size == 0:
            continue
        passed_at = np.interp(reached[:, columns], reached[leader], times)
        gaps[:, columns] = np.maximum(times[columns] - passed_at, 0.0)
    return gaps


def best_lap_so_far(lap_ends: np.ndarray, lap_times: np.ndarray, times: np.ndarray) -> np.ndarray:
    """A driver's best valid lap time completed by each sample time (NaN if none)."""
    if lap_ends.size == 0:
        return np.full(len(times), np.nan)
    order = np.argsort(lap_ends)
    ends = lap_ends[order]
    running_best = np.minimum.accumulate(np.where(np.isnan(lap_times[order]), np.inf, lap_times[order]))
    completed = np.searchsorted(ends, times, side="right") - 1
    best = np.where(completed >= 0, running_best[np.clip(completed, 0, None)], np.inf)
    return np.where(np.isinf(best), np.nan, best)


def best_lap_order(best: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Qualifying/practice order by best lap so far, and the gap to the fastest.

    Drivers without a time rank behind everyone with one.
    """
    positions = _ranks(np.where(np.isnan(best), np.inf, best))
    with np.errstate(all="ignore"):
        fastest = np.nanmin(np.where(np.isnan(best), np.inf, best), axis=0)
    gaps = np.where(np.isfinite(fastest), best - fastest, np.nan)
    return positions, gaps
