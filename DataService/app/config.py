from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated configuration, loaded once from the environment."""

    model_config = SettingsConfigDict(
        env_file="env/.env", env_file_encoding="utf-8", extra="ignore"
    )

    port: int = 8000
    fastf1_cache_dir: str = ".fastf1-cache"

    # Comma-separated origins allowed by CORS (the backend service).
    cors_origins: str = "http://localhost:3001"

    # Shared secret required from internal callers (the NestJS backend).
    # When empty, the auth check is disabled (local development only).
    internal_api_key: str = ""

    # F1 TV account FastF1 signs in with; livetiming.formula1.com requires it.
    f1_username: str = ""
    f1_password: SecretStr = SecretStr("")

    @property
    def has_f1_account(self) -> bool:
        return bool(self.f1_username and self.f1_password.get_secret_value())

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
