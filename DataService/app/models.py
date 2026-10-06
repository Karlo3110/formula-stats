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
    grid_position: int | None = None
    laps: int | None = None
    # Total race time; only set for cars on the lead lap.
    time_seconds: float | None = None
    team_color: str | None = None
    headshot_url: str | None = None
    # Driver nationality, ISO 3166-1 alpha-3 (e.g. "GBR").
    country_code: str | None = None


class SessionResults(BaseModel):
    season: int
    round_number: int
    session: str
    results: list[DriverResult]


class DriverProfile(BaseModel):
    code: str
    number: str | None
    full_name: str
    team_name: str | None
    team_color: str | None
    headshot_url: str | None
    country_code: str | None


class SeasonDrivers(BaseModel):
    season: int
    # Race the profiles were taken from (latest finished race of the season).
    round_number: int | None
    drivers: list[DriverProfile]


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


class ReplayMessage(BaseModel):
    # Seconds on the shared replay clock (same axis as ReplayDriver sample t).
    time: float
    category: str
    message: str
    # Flag colour for Category=="Flag" (e.g. GREEN/YELLOW/DOUBLE YELLOW/RED).
    flag: str | None
    # Where it applies: Track / Sector / Driver.
    scope: str | None


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
    messages: list[ReplayMessage]


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
