"""Public, rate-limited API for the client website's live demo call.

    POST /api/demo/session              {"scenario_id": "payment_retry"}
         -> {session_id, scenario_id, livekit_url, token, expires_at}
    GET  /api/demo/session/{id}         -> {status: "pending"|"ended", outcome}
    POST /api/demo/session/{id}/end     -> {ok: true}

These are the only unauthenticated JSON routes. They never take a phone
number (nothing here can dial anyone) and they're off unless
DEMO_ENABLED=true.

Limits live in-process under a single uvicorn worker (local dev). On
Vercel every request may hit a fresh function instance, so there they
live in Postgres instead (the `demo_slot` table) — see `_make_limits`.
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
    """In-process limits: fine for the single uvicorn worker run locally."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._by_ip: dict[str, deque[float]] = defaultdict(deque)
        self._active: dict[str, float] = {}

    def reset(self) -> None:
        with self._lock:
            self._by_ip.clear()
            self._active.clear()

    def acquire(self, ip: str) -> None:
        """Raise 429 if this IP is over its hourly quota or the demo is full.
        Returns a reservation for `hold` / `abandon` (unused in-process)."""
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

    def hold(self, reservation: None, session_id: str) -> None:
        with self._lock:
            self._active[session_id] = time.monotonic()

    def abandon(self, reservation: None) -> None:
        """The session never started; the hit still counts toward the quota."""

    def release(self, session_id: str) -> None:
        with self._lock:
            self._active.pop(session_id, None)


_SLOT_SCHEMA = """
CREATE TABLE IF NOT EXISTS demo_slot (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ip         TEXT NOT NULL,
    session_id TEXT UNIQUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS demo_slot_ip_started ON demo_slot (ip, started_at);
CREATE INDEX IF NOT EXISTS demo_slot_started ON demo_slot (started_at);
"""

# serialises acquire() across instances so two requests can't both take
# the last slot (arbitrary constant, unique to this lock)
_SLOT_LOCK_KEY = 7_311_204_019


class _PgLimits:
    """The same limits as `_Limits`, shared by every instance via Postgres.

    One row per demo start. A row counts toward its IP's hourly quota for
    an hour, and holds a live slot until `ended_at` is set or it's older
    than `_SLOT_TTL_S`.
    """

    def __init__(self) -> None:
        self._schema_ready = False

    def _conn(self):
        from audit import db

        if not self._schema_ready:
            with db.get_conn() as conn:
                conn.execute(_SLOT_SCHEMA)
            self._schema_ready = True
        return db.get_conn()

    def acquire(self, ip: str) -> int:
        per_hour = _int_env("DEMO_RATE_LIMIT_PER_HOUR", 5)
        max_live = _int_env("DEMO_MAX_CONCURRENT", 2)
        with self._conn() as conn:
            conn.execute("SELECT pg_advisory_xact_lock(%s)", (_SLOT_LOCK_KEY,))
            conn.execute("DELETE FROM demo_slot WHERE started_at < now() - interval '1 day'")
            (hits,) = conn.execute(
                "SELECT count(*) FROM demo_slot"
                " WHERE ip = %s AND started_at > now() - interval '1 hour'", (ip,),
            ).fetchone()
            if hits >= per_hour:
                raise HTTPException(429, "Too many demo calls from this network. Try again later.")
            (live,) = conn.execute(
                "SELECT count(*) FROM demo_slot WHERE ended_at IS NULL"
                " AND started_at > now() - make_interval(secs => %s)", (_SLOT_TTL_S,),
            ).fetchone()
            if live >= max_live:
                raise HTTPException(429, "All demo lines are busy. Try again in a few minutes.")
            (slot_id,) = conn.execute(
                "INSERT INTO demo_slot (ip) VALUES (%s) RETURNING id", (ip,),
            ).fetchone()
        return slot_id

    def hold(self, reservation: int, session_id: str) -> None:
        with self._conn() as conn:
            conn.execute("UPDATE demo_slot SET session_id = %s WHERE id = %s",
                         (session_id, reservation))

    def abandon(self, reservation: int) -> None:
        with self._conn() as conn:
            conn.execute("UPDATE demo_slot SET ended_at = now() WHERE id = %s", (reservation,))

    def release(self, session_id: str) -> None:
        with self._conn() as conn:
            conn.execute("UPDATE demo_slot SET ended_at = now()"
                         " WHERE session_id = %s AND ended_at IS NULL", (session_id,))


def _make_limits() -> _Limits | _PgLimits:
    """Postgres on Vercel (VERCEL is set there) or when asked for."""
    backend = os.environ.get("DEMO_LIMITS_BACKEND", "").strip().lower()
    if backend == "postgres" or (not backend and os.environ.get("VERCEL")):
        return _PgLimits()
    return _Limits()


limits = _make_limits()


class StartRequest(BaseModel):
    scenario_id: str


def _client_ip(request: Request) -> str:
    # Behind Vercel's proxy request.client is the proxy, not the visitor.
    # Vercel sets x-real-ip / x-forwarded-for itself (overwriting anything
    # the client sent), so they're only trusted there.
    if os.environ.get("VERCEL"):
        ip = (request.headers.get("x-real-ip")
              or request.headers.get("x-forwarded-for", "").split(",")[0]).strip()
        if ip:
            return ip
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
    try:
        reservation = limits.acquire(_client_ip(request))
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 — DB down: fail closed
        logger.exception("could not check demo limits")
        raise HTTPException(503, "The live demo is unavailable right now.") from exc
    try:
        session = await demo.start_session(body.scenario_id)
    except Exception as exc:
        _quietly(limits.abandon, reservation)
        if isinstance(exc, demo.DemoUnavailable):
            logger.error("demo unavailable: %s", exc)
            raise HTTPException(503, "The live demo is not configured on this server.") from exc
        # LiveKit down / bad creds
        logger.exception("could not start demo session")
        raise HTTPException(502, "Could not reach the voice service.") from exc
    _quietly(limits.hold, reservation, session["session_id"])
    return session


def _quietly(fn, *args) -> None:
    """Limit bookkeeping must never fail a call that's already set up; a
    lost update just means the slot frees itself after _SLOT_TTL_S."""
    try:
        fn(*args)
    except Exception:  # noqa: BLE001
        logger.exception("demo limit bookkeeping failed")


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
    _quietly(limits.release, session_id)
    return {"session_id": session_id, "status": "ended", "outcome": out}


@router.post("/session/{session_id}/end")
async def end_session(session_id: str) -> dict:
    _check_id(session_id)
    _require_enabled()
    try:
        await demo.end_session(session_id)
    except demo.DemoUnavailable as exc:
        raise HTTPException(503, "The live demo is not configured on this server.") from exc
    _quietly(limits.release, session_id)
    return {"ok": True}
