"""Formula 1 account sign-in for FastF1's live-timing requests.

Since October 2026 livetiming.formula1.com serves its archive (timing, car
positions and the driver list with headshots) only to signed-in F1 TV
subscribers. FastF1 3.9+ signs in by itself with the credentials in the
F1_USERNAME and F1_PASSWORD environment variables; without them it falls back
to Ergast results only.
"""

import os

from app.config import Settings

ENV_USERNAME = "F1_USERNAME"
ENV_PASSWORD = "F1_PASSWORD"


def provide_f1_account(settings: Settings) -> None:
    """Expose the configured credentials to FastF1, which reads only the
    process environment (locally they may come from env/.env instead)."""
    if not settings.has_f1_account:
        return
    os.environ.setdefault(ENV_USERNAME, settings.f1_username)
    os.environ.setdefault(ENV_PASSWORD, settings.f1_password.get_secret_value())
