"""Runs memory-heavy FastF1 work in a short-lived child process.

pandas and FastF1 keep their heap after a session load (CPython rarely hands
freed memory back to the OS), so a long-lived server sits near 1 GB for good
once it has built a single replay. Each job instead gets a freshly spawned
process that exits when the job is done, returning all of that memory. The
server process itself never imports FastF1 and stays small while idle.
"""

import multiprocessing
import threading
from collections.abc import Callable
from concurrent.futures import ProcessPoolExecutor
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

# Bounds peak memory: each job holds one loaded session (~0.5-1 GB at most).
MAX_CONCURRENT_JOBS = 2

_job_slots = threading.BoundedSemaphore(MAX_CONCURRENT_JOBS)
# "spawn" starts from a clean interpreter, so no parent memory is inherited.
_spawn = multiprocessing.get_context("spawn")


def run_isolated(job: Callable[P, R], *args: P.args, **kwargs: P.kwargs) -> R:
    """Run `job` in its own process and return its result (or re-raise its error)."""
    with _job_slots, ProcessPoolExecutor(max_workers=1, mp_context=_spawn) as pool:
        return pool.submit(job, *args, **kwargs).result()
