import os

import pytest

from app.fastf1_client import SessionDataUnavailableError
from app.isolation import run_isolated
from tests import isolation_jobs


class TestRunIsolated:
    def test_runs_the_job_in_a_separate_process(self) -> None:
        assert run_isolated(isolation_jobs.process_id) != os.getpid()

    def test_returns_the_job_result(self) -> None:
        assert run_isolated(isolation_jobs.add, 2, b=3) == 5

    def test_reraises_typed_errors_so_routers_can_map_them(self) -> None:
        with pytest.raises(SessionDataUnavailableError, match="not published"):
            run_isolated(isolation_jobs.unavailable, "not published")
