"""Local file logging for the voice worker.

revrag logs everything DEBUG-level through loguru -> CloudWatch, with a
log-stream handoff per call so one call's trace is easy to find. We don't
have CloudWatch wired up here, so this borrows the same two ideas and
writes to disk instead: one rotating file for the whole worker process,
plus one file per call (named by event_id) holding just that call's full
DEBUG trace -- nothing to scroll past to find it.
"""
from __future__ import annotations

import logging
import logging.handlers
from contextlib import contextmanager
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
CALLS_DIR = LOG_DIR / "calls"

_FORMAT = "%(asctime)s %(levelname)-7s %(name)s: %(message)s"

# Noisy at DEBUG, rarely useful for diagnosing a call.
_QUIET_AT_DEBUG = ("httpx", "httpcore", "urllib3", "asyncio")


def setup_worker_logging() -> None:
    """Call once, before the worker starts. DEBUG from every logger goes
    to logs/worker.log; the console keeps whatever level LiveKit's own
    cli already set (we only add a file handler, not touch the console
    one), so this doesn't flood the terminal."""
    LOG_DIR.mkdir(exist_ok=True)
    CALLS_DIR.mkdir(exist_ok=True)

    file_handler = logging.handlers.RotatingFileHandler(
        LOG_DIR / "worker.log", maxBytes=10_000_000, backupCount=5, encoding="utf-8",
    )
    file_handler.setFormatter(logging.Formatter(_FORMAT))
    file_handler.setLevel(logging.DEBUG)

    root = logging.getLogger()
    root.addHandler(file_handler)
    root.setLevel(logging.DEBUG)

    for name in _QUIET_AT_DEBUG:
        logging.getLogger(name).setLevel(logging.WARNING)


@contextmanager
def per_call_log_file(event_id: str):
    """Attach a DEBUG file handler scoped to one call's event_id for the
    duration of the `with` block, so logs/calls/<event_id>.log holds
    exactly that call's full trace."""
    handler = logging.FileHandler(CALLS_DIR / f"{event_id}.log", encoding="utf-8")
    handler.setFormatter(logging.Formatter(_FORMAT))
    handler.setLevel(logging.DEBUG)
    root = logging.getLogger()
    root.addHandler(handler)
    try:
        yield
    finally:
        root.removeHandler(handler)
        handler.close()
