"""Module-level jobs for the isolation tests (a spawned child imports them by name)."""

import os

from app.fastf1_client import SessionDataUnavailableError


def process_id() -> int:
    return os.getpid()


def add(a: int, b: int) -> int:
    return a + b


def unavailable(message: str) -> None:
    raise SessionDataUnavailableError(message)
