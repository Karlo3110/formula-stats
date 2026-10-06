"""Driver profiles (headshot, number, nationality, team colour) for a season.

Taken from the official classification of the season's most recent finished
race, which carries the live-timing driver list. Falls back through a few
earlier races if the newest one has not been published yet.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from app.fastf1_client import ensure_cache
from app.models import SeasonDrivers
from app.result_mapping import map_driver_profiles

logger = logging.getLogger(__name__)

RACE_SESSION_NAME = "Race"
SESSION_SLOTS = range(1, 6)
# A race is only treated as finished (and published) a while after it starts.
PUBLISH_DELAY = timedelta(hours=3)
MAX_RACES_TRIED = 3


def _race_start(row: Any) -> datetime | None:
    """UTC start of the event's Race session (schedule rows are pandas Series)."""
    import pandas as pd

    for slot in SESSION_SLOTS:
        if row.get(f"Session{slot}") == RACE_SESSION_NAME:
            start = row.get(f"Session{slot}DateUtc")
            if start is None or pd.isna(start):
                return None
            return start.to_pydatetime().replace(tzinfo=timezone.utc)
    return None


def _finished_rounds_newest_first(season: int) -> list[int]:
    import fastf1

    schedule = fastf1.get_event_schedule(season, include_testing=False)
    cutoff = datetime.now(timezone.utc) - PUBLISH_DELAY
    finished = [
        int(row["RoundNumber"])
        for _, row in schedule.iterrows()
        if (start := _race_start(row)) is not None and start <= cutoff
    ]
    return sorted(finished, reverse=True)


def get_season_drivers(season: int) -> SeasonDrivers:
    ensure_cache()
    import fastf1

    for round_number in _finished_rounds_newest_first(season)[:MAX_RACES_TRIED]:
        try:
            loaded = fastf1.get_session(season, round_number, RACE_SESSION_NAME)
            loaded.load(laps=False, telemetry=False, weather=False, messages=False)
            drivers = map_driver_profiles(row for _, row in loaded.results.iterrows())
        except Exception:
            # Best effort: an unpublished race falls through to the previous one.
            logger.warning("Driver list unavailable for %s round %s", season, round_number, exc_info=True)
            continue
        if drivers:
            return SeasonDrivers(season=season, round_number=round_number, drivers=drivers)

    return SeasonDrivers(season=season, round_number=None, drivers=[])
