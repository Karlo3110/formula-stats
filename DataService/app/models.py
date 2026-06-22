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
    # Normalized circuit outline as [x, elevation, y] triples (centered, scaled
    # to world units; elevation lifted so the lowest point sits at 0).
    track: list[list[float]]


class ReplayDriver(BaseModel):
    code: str
    team: str
    color: str | None
    # [t, x, y, elevation, speed, position, progress, onTrack] where t is seconds
    # from the window start (shared race clock); x/y/elevation are normalized
    # world coords; onTrack is 1.0 (OnTrack) or 0.0 (OffTrack).
    samples: list[list[float]]


class ReplaySession(BaseModel):
    season: int
    round_number: int
    session: str
    durationSeconds: float
    lightsOutSeconds: float
    trackWidth: float
    carScale: float
    track: list[list[float]]
    drivers: list[ReplayDriver]


class WeekendSession(BaseModel):
    name: str
    start_utc: str | None


class WeekendEvent(BaseModel):
    round_number: int
    country: str
    location: str
    event_name: str
    sessions: list[WeekendSession]


class WeekendSchedule(BaseModel):
    season: int
    events: list[WeekendEvent]


class DriverStandingRow(BaseModel):
    position: int
    code: str
    given_name: str
    family_name: str
    team: str
    points: float
    wins: int


class ConstructorStandingRow(BaseModel):
    position: int
    name: str
    points: float
    wins: int


class SeasonStandings(BaseModel):
    season: int
    drivers: list[DriverStandingRow]
    constructors: list[ConstructorStandingRow]
