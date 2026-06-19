from fastapi import Header, HTTPException, status

from app.config import get_settings


def require_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    """Guards the data endpoints with a shared secret from the backend.

    Disabled when INTERNAL_API_KEY is unset (local development only).
    """
    expected = get_settings().internal_api_key
    if not expected:
        return
    if x_internal_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key.",
        )
