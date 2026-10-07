"""Public, rate-limited API for the client website's live demo call.

    POST /api/demo/session              {"scenario_id": "payment_retry"}
         -> {session_id, scenario_id, livekit_url, token, expires_at}
    GET  /api/demo/session/{id}         -> {status: "pending"|"ended", outcome}
    POST /api/demo/session/{id}/end     -> {ok: true}

These are the only unauthenticated JSON routes. They never take a phone
number (nothing here can dial anyone) and they're off unless
DEMO_ENABLED=true. Limits are in-process, which fits the single uvicorn
worker this app runs as.
"""
from __future__ import annotations

import logging
import os
import threading
import time
from collections import defaultdict, deque

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from voice import demo

logger = logging.getLogger("metrics.demo_api")

router = APIRouter(prefix="/api/demo", tags=["demo"])

# a live call lasts at most voice.config.DEMO_MAX_CALL_DURATION_S; slots
# older than this are assumed finished even if /end was never called.
_SLOT_TTL_S = 5 * 60


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


class _Limits:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._by_ip: dict[str, deque[float]] = defaultdict(deque)
        self._active: dict[str, float] = {}

    def reset(self) -> None:
        with self._lock:
            self._by_ip.clear()
            self._active.clear()

    def acquire(self, ip: str) -> None:
        """Raise 429 if this IP is over its hourly quota or the demo is full."""
        per_hour = _int_env("DEMO_RATE_LIMIT_PER_HOUR", 5)
        max_live = _int_env("DEMO_MAX_CONCURRENT", 2)
        now = time.monotonic()
        with self._lock:
            hits = self._by_ip[ip]
            while hits and now - hits[0] > 3600:
                hits.popleft()
            for sid, t in list(self._active.items()):
                if now - t > _SLOT_TTL_S:
                    del self._active[sid]
            if len(hits) >= per_hour:
                raise HTTPException(429, "Too many demo calls from this network. Try again later.")
            if len(self._active) >= max_live:
                raise HTTPException(429, "All demo lines are busy. Try again in a few minutes.")
            hits.append(now)

    def hold(self, session_id: str) -> None:
        with self._lock:
            self._active[session_id] = time.monotonic()

    def release(self, session_id: str) -> None:
        with self._lock:
            self._active.pop(session_id, None)


limits = _Limits()


class StartRequest(BaseModel):
    scenario_id: str


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _require_enabled() -> None:
    if not demo.enabled():
        raise HTTPException(503, "The live demo is not enabled on this server.")


def _check_id(session_id: str) -> None:
    if not demo.SESSION_ID_RE.match(session_id):
        raise HTTPException(422, "invalid session id")


@router.post("/session")
async def start_session(body: StartRequest, request: Request) -> dict:
    _require_enabled()
    if body.scenario_id not in demo.SCENARIOS:
        raise HTTPException(422, f"Unknown scenario. Live scenarios: {', '.join(demo.SCENARIOS)}")
    limits.acquire(_client_ip(request))
    try:
        session = await demo.start_session(body.scenario_id)
    except demo.DemoUnavailable as exc:
        logger.error("demo unavailable: %s", exc)
        raise HTTPException(503, "The live demo is not configured on this server.") from exc
    except Exception as exc:  # noqa: BLE001 — LiveKit down / bad creds
        logger.exception("could not start demo session")
        raise HTTPException(502, "Could not reach the voice service.") from exc
    limits.hold(session["session_id"])
    return session


@router.get("/session/{session_id}")
def session_status(session_id: str) -> dict:
    _check_id(session_id)
    try:
        out = demo.outcome(session_id)
    except Exception as exc:  # noqa: BLE001 — DB down
        logger.exception("could not read demo outcome")
        raise HTTPException(503, "Could not read the call result.") from exc
    if out is None:
        return {"session_id": session_id, "status": "pending", "outcome": None}
    limits.release(session_id)
    return {"session_id": session_id, "status": "ended", "outcome": out}


@router.post("/session/{session_id}/end")
async def end_session(session_id: str) -> dict:
    _check_id(session_id)
    _require_enabled()
    try:
        await demo.end_session(session_id)
    except demo.DemoUnavailable as exc:
        raise HTTPException(503, "The live demo is not configured on this server.") from exc
    limits.release(session_id)
    return {"ok": True}
