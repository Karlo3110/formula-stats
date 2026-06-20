from pydantic import BaseModel


class HealthStatus(BaseModel):
    status: str


class EventSummary(BaseModel):
    round_number: int
    country: str
    location: str
    event_name: str
    event_date: str | None


class SeasonSchedule(BaseModel):
    season: int
    events: list[EventSummary]


class DriverResult(BaseModel):
    position: int | None
    driver_number: str
    abbreviation: str
    full_name: str
    team_name: str
    points: float
    status: str


class SessionResults(BaseModel):
    season: int
    round_number: int
    session: str
    results: list[DriverResult]


class TrackMap(BaseModel):
    season: int
    round_number: int
    session: str
    # Normalized circuit outline as [x, y] pairs (centered, scaled to world units).
    track: list[list[float]]
