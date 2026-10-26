from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from app.fastf1_client import (
    SessionDataUnavailableError,
    get_event_schedule,
    get_replay,
    get_schedule,
    get_session_results,
    get_standings,
    get_track_map,
)
from app.isolation import run_isolated, run_isolated_json
from app.models import (
    ReplaySession,
    SeasonDrivers,
    SeasonSchedule,
    SeasonStandings,
    SessionResults,
    TrackMap,
    WeekendSchedule,
)
from app.season_drivers import get_season_drivers
from app.security import require_internal_key

# Every handler runs its FastF1 work in a short-lived child process (see
# app.isolation) so a session load never leaves the server holding its memory.
# Handlers return the JSON the child encoded; response_model documents its shape.
router = APIRouter(
    prefix="/api/v1",
    tags=["f1"],
    dependencies=[Depends(require_internal_key)],
)


@router.get("/seasons/{season}/events", response_model=SeasonSchedule)
def list_events(season: int) -> SeasonSchedule:
    return SeasonSchedule(season=season, events=run_isolated(get_event_schedule, season))


@router.get("/seasons/{season}/schedule", response_model=WeekendSchedule)
def schedule(season: int) -> Response:
    return _json(run_isolated_json(get_schedule, season))


@router.get("/seasons/{season}/standings", response_model=SeasonStandings)
def standings(season: int) -> Response:
    return _json(run_isolated_json(get_standings, season))


@router.get("/seasons/{season}/drivers", response_model=SeasonDrivers)
def season_drivers(season: int) -> Response:
    return _json(run_isolated_json(get_season_drivers, season))


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/results",
    response_model=SessionResults,
)
def session_results(season: int, round_number: int, session: str) -> Response:
    return _json(run_isolated_json(get_session_results, season, round_number, session))


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/track-map",
    response_model=TrackMap,
)
def track_map(season: int, round_number: int, session: str) -> Response:
    try:
        return _json(run_isolated_json(get_track_map, season, round_number, session))
    except SessionDataUnavailableError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get(
    "/seasons/{season}/rounds/{round_number}/sessions/{session}/replay",
    response_model=ReplaySession,
)
def replay(season: int, round_number: int, session: str) -> Response:
    try:
        return _json(run_isolated_json(get_replay, season, round_number, session))
    except SessionDataUnavailableError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


def _json(body: bytes) -> Response:
    return Response(content=body, media_type="application/json")
