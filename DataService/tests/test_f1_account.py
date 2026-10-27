import os

import pytest
from pydantic import SecretStr

from app.config import Settings
from app.f1_account import ENV_PASSWORD, ENV_USERNAME, provide_f1_account


@pytest.fixture(autouse=True)
def clean_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv(ENV_USERNAME, raising=False)
    monkeypatch.delenv(ENV_PASSWORD, raising=False)


def make_settings(username: str, password: str) -> Settings:
    return Settings(_env_file=None, f1_username=username, f1_password=SecretStr(password))


class TestProvideF1Account:
    def test_exports_configured_credentials_for_fastf1(self) -> None:
        provide_f1_account(make_settings("fan@example.com", "s3cret"))

        assert (os.environ[ENV_USERNAME], os.environ[ENV_PASSWORD]) == ("fan@example.com", "s3cret")

    def test_leaves_the_environment_alone_without_an_account(self) -> None:
        provide_f1_account(make_settings("", ""))

        assert ENV_USERNAME not in os.environ

    def test_keeps_credentials_already_in_the_environment(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv(ENV_USERNAME, "platform@example.com")
        monkeypatch.setenv(ENV_PASSWORD, "from-platform")

        provide_f1_account(make_settings("file@example.com", "from-file"))

        assert os.environ[ENV_USERNAME] == "platform@example.com"


class TestHasF1Account:
    def test_needs_both_username_and_password(self) -> None:
        assert not make_settings("fan@example.com", "").has_f1_account
