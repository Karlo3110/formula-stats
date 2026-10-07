from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.config import get_settings
from app.models import HealthStatus
from app.routers import f1

settings = get_settings()

app = FastAPI(title="Formula Stats Data Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Full-session replays are several MB of numbers; they compress ~5x.
app.add_middleware(GZipMiddleware, minimum_size=1024)

app.include_router(f1.router)


@app.get("/health/live", response_model=HealthStatus, tags=["health"])
def live() -> HealthStatus:
    return HealthStatus(status="ok")


@app.get("/health/ready", response_model=HealthStatus, tags=["health"])
def ready() -> HealthStatus:
    return HealthStatus(status="ok")
