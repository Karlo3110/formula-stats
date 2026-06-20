from fastapi import APIRouter, Depends

from app.fastf1_client import (
    get_event_schedule,
    get_replay,
    get_schedule,
    get_session_results,
    get_standings,
    get_track_map,
)
from app.models import (
    ReplaySession,
    SeasonSchedule,
    SeasonStandings,
    SessionResults,
    TrackMap,
    WeekendSchedule,
)
from app.security import require_internal_key

router = APIRouter(
    prefix="/api/v1",
    tags=["f1"],
    dependencies=[Depends(require_internal_key)],
)


@router.get("/seasons/{season}/events", response_model=SeasonSchedule)
def list_events(season: int) -> SeasonSchedule:
    return SeasonSchedule(season=season, events=get_event_schedule(season))


@router.get("/seasons/{season}/schedule", response_model=WeekendSchedule)
def schedule(season: int) -> WeekendSchedule:
    return get_schedule(season)


@router.get("/seasons/{season}/standings", response_model=SeasonStandings)
def standings(season: int) -> SeasonStandings:
    return get_standings(season)


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/results",
    response_model=SessionResults,
)
def session_results(season: int, round_number: int, session: str) -> SessionResults:
    return get_session_results(season, round_number, session)


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/track-map",
    response_model=TrackMap,
)
def track_map(season: int, round_number: int, session: str) -> TrackMap:
    return get_track_map(season, round_number, session)


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/replay",
    response_model=ReplaySession,
)
def replay(season: int, round_number: int, session: str) -> ReplaySession:
    return get_replay(season, round_number, session)
