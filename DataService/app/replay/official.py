"""Official running order and gaps from F1 live timing (the TV timing tower).

The live timing feed carries every car's Position and GapToLeader several
times a second. It is the authority for the order: positions derived from
GPS map-matching are only a fallback where the feed has no value.
Arrays are shaped (drivers, samples); NaN means "no value".
"""

import math
from datetime import timedelta

import numpy as np


def parse_gap(value: object) -> float:
    """Seconds behind the leader from a timing string ("+1.234"); NaN when unknown or lapped."""
    if isinstance(value, timedelta):
        return value.total_seconds()
    if not isinstance(value, str):
        return math.nan
    text = value.strip().upper()
    if text.startswith("LAP"):
        return 0.0  # the leader's row shows the lap counter instead of a gap
    if text.startswith("+"):
        try:
            return float(text[1:])
        except ValueError:
            return math.nan
    return math.nan  # "1L" (lapped) or empty


def step_sample(source_times: np.ndarray, values: np.ndarray, sample_times: np.ndarray) -> np.ndarray:
    """Latest known value at each sample time (the feed only sends changes)."""
    known = ~np.isnan(values)
    times, values = source_times[known], values[known]
    result = np.full(sample_times.shape, np.nan)
    if times.size == 0:
        return result
    index = np.searchsorted(times, sample_times, side="right") - 1
    has_value = index >= 0
    result[has_value] = values[index[has_value]]
    return result


def merge_positions(official: np.ndarray, computed: np.ndarray) -> np.ndarray:
    """1-based order per sample: official positions first, computed ones break ties and fill gaps."""
    drivers = official.shape[0]
    primary = np.where(np.isnan(official), drivers + computed, official)
    ranks = np.empty(official.shape, dtype=int)
    for column in range(official.shape[1]):
        order = np.lexsort((computed[:, column], primary[:, column]))
        ranks[order, column] = np.arange(1, drivers + 1)
    return ranks


def merge_gaps(official: np.ndarray, computed: np.ndarray, positions: np.ndarray) -> np.ndarray:
    """Official gap where the feed has one, the leader at zero, computed gaps elsewhere."""
    merged = np.where(np.isnan(official), computed, official)
    return np.where(positions == 1, 0.0, merged)
