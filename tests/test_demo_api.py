"""Public website-demo API (metrics/demo_api.py, voice/demo.py).

LiveKit is stubbed: these check validation, gating, limits, CORS and
that demo calls stay out of the merchant dashboard.
"""
import json

import pytest
from fastapi.testclient import TestClient

from audit import db
from metrics import demo_api
from metrics.app import _is_test_artifact, app
from voice import demo

ORIGIN = "http://localhost:3000"


@pytest.fixture()
def anon(monkeypatch):
    monkeypatch.setenv("DEMO_ENABLED", "true")
    monkeypatch.setenv("DEMO_RATE_LIMIT_PER_HOUR", "3")
    monkeypatch.setenv("DEMO_MAX_CONCURRENT", "2")
    demo_api.limits.reset()

    async def fake_start(scenario_id):
        ev = demo.build_event(scenario_id)
        return {"session_id": ev.event_id, "scenario_id": scenario_id,
                "livekit_url": "wss://example.livekit.cloud", "token": "jwt",
                "expires_at": "2026-01-01T00:00:00+00:00"}

    async def fake_end(session_id):
        return None

    monkeypatch.setattr(demo, "start_session", fake_start)
    monkeypatch.setattr(demo, "end_session", fake_end)
    yield TestClient(app)
    demo_api.limits.reset()


def test_start_session_is_public_and_returns_token(anon):
    r = anon.post("/api/demo/session", json={"scenario_id": "payment_retry"})
    assert r.status_code == 200
    body = r.json()
    assert demo.SESSION_ID_RE.match(body["session_id"])
    assert body["token"] and body["livekit_url"].startswith("wss://")


def test_unknown_scenario_is_422(anon):
    r = anon.post("/api/demo/session", json={"scenario_id": "real_estate"})
    assert r.status_code == 422
    assert anon.post("/api/demo/session", json={}).status_code == 422


def test_disabled_is_503(anon, monkeypatch):
    monkeypatch.setenv("DEMO_ENABLED", "false")
    r = anon.post("/api/demo/session", json={"scenario_id": "payment_retry"})
    assert r.status_code == 503


def test_unconfigured_livekit_is_503(monkeypatch):
    monkeypatch.setenv("DEMO_ENABLED", "true")
    for k in ("LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"):
        monkeypatch.setenv(k, "")
    demo_api.limits.reset()
    r = TestClient(app).post("/api/demo/session", json={"scenario_id": "payment_retry"})
    assert r.status_code == 503
    demo_api.limits.reset()


def test_concurrency_cap_then_release(anon):
    ids = [anon.post("/api/demo/session", json={"scenario_id": "payment_retry"}).json()["session_id"]
           for _ in range(2)]
    r = anon.post("/api/demo/session", json={"scenario_id": "payment_retry"})
    assert r.status_code == 429 and "busy" in r.json()["detail"]
    assert anon.post(f"/api/demo/session/{ids[0]}/end").status_code == 200
    assert anon.post("/api/demo/session", json={"scenario_id": "payment_retry"}).status_code == 200


def test_per_ip_rate_limit(anon):
    for _ in range(3):
        sid = anon.post("/api/demo/session", json={"scenario_id": "mandate_failure"}).json()["session_id"]
        anon.post(f"/api/demo/session/{sid}/end")
    r = anon.post("/api/demo/session", json={"scenario_id": "mandate_failure"})
    assert r.status_code == 429 and "Too many" in r.json()["detail"]


def test_bad_session_id_is_422(anon):
    # dot-segments resolve to the real path, which is still login-gated
    r = anon.get("/api/demo/session/../../api/calls", follow_redirects=False)
    assert r.status_code == 303 and r.headers["location"].startswith("/login")
    assert anon.get("/api/demo/session/evt_123").status_code == 422
    assert anon.post("/api/demo/session/evt_123/end").status_code == 422


def test_cors_preflight_allows_site_origin_only(anon):
    ok = anon.options("/api/demo/session", headers={
        "Origin": ORIGIN, "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type"})
    assert ok.status_code == 200
    assert ok.headers["access-control-allow-origin"] == ORIGIN
    bad = anon.options("/api/demo/session", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in bad.headers


def test_dashboard_still_requires_login(anon):
    r = anon.get("/api/calls", follow_redirects=False)
    assert r.status_code == 303 and r.headers["location"].startswith("/login")


def test_demo_job_metadata_never_dials():
    ev = demo.build_event("checkout_abandonment")
    meta = json.loads(demo.job_metadata(ev, "Saanjh Living"))
    assert meta["_call"] == {"attempt_number": 1, "merchant": "Saanjh Living",
                             "dial": False, "demo": True}
    assert ev.amount_inr == 4200 and ev.customer.phone == "browser"


def test_agent_parses_demo_flag():
    from voice.agent import _parse_metadata

    ev = demo.build_event("payment_retry")
    *_, dial, is_demo = _parse_metadata(demo.job_metadata(ev, "Kavya Home Store"))
    assert dial is False and is_demo is True


def test_demo_events_hidden_from_dashboard():
    assert _is_test_artifact("demo_0123456789ab")


@pytest.mark.skipif(not db.ping(), reason="Postgres not reachable")
def test_session_status_pending_then_ended(anon):
    from audit.log import append_event
    from voice.outcome import CallOutcome, write_call_audit

    ev = demo.build_event("payment_retry")
    r = anon.get(f"/api/demo/session/{ev.event_id}")
    assert r.status_code == 200 and r.json()["status"] == "pending"

    out = CallOutcome(result="recovered", attempt_number=1, duration_s=42.0,
                      consent_captured=True,
                      transcript=[{"role": "assistant", "text": "Namaste"}])
    with db.get_conn() as conn:
        write_call_audit(lambda **kw: append_event(conn, **kw), ev, out)
    body = anon.get(f"/api/demo/session/{ev.event_id}").json()
    assert body["status"] == "ended"
    assert body["outcome"]["result"] == "recovered"
    assert body["outcome"]["transcript"][0]["text"] == "Namaste"


def test_client_ip_trusts_forwarded_headers_only_on_vercel(anon, monkeypatch):
    seen = []
    real_acquire = demo_api.limits.acquire
    monkeypatch.setattr(demo_api.limits, "acquire", lambda ip: seen.append(ip) or real_acquire(ip))
    hdrs = {"x-real-ip": "203.0.113.7", "x-forwarded-for": "203.0.113.7, 10.0.0.1"}
    anon.post("/api/demo/session", json={"scenario_id": "payment_retry"}, headers=hdrs)
    monkeypatch.setenv("VERCEL", "1")
    anon.post("/api/demo/session", json={"scenario_id": "payment_retry"}, headers=hdrs)
    assert seen == ["testclient", "203.0.113.7"]


def test_limits_backend_selection(monkeypatch):
    monkeypatch.delenv("DEMO_LIMITS_BACKEND", raising=False)
    monkeypatch.delenv("VERCEL", raising=False)
    assert isinstance(demo_api._make_limits(), demo_api._Limits)
    monkeypatch.setenv("VERCEL", "1")
    assert isinstance(demo_api._make_limits(), demo_api._PgLimits)
    monkeypatch.setenv("DEMO_LIMITS_BACKEND", "memory")
    assert isinstance(demo_api._make_limits(), demo_api._Limits)


# --- Postgres-backed limits (Vercel). demo_slot isn't append-only, so test
# rows (ip "pytest-…") are deleted by ip on teardown.

@pytest.fixture()
def pg_limits():
    import uuid

    lim = demo_api._PgLimits()
    prefix = f"pytest-{uuid.uuid4().hex[:8]}"
    yield lim, prefix
    with db.get_conn() as conn:
        conn.execute("DELETE FROM demo_slot WHERE ip LIKE %s", (f"{prefix}%",))


def _live_slots() -> int:
    with db.get_conn() as conn:
        return conn.execute(
            "SELECT count(*) FROM demo_slot WHERE ended_at IS NULL"
            " AND started_at > now() - make_interval(secs => %s)", (demo_api._SLOT_TTL_S,),
        ).fetchone()[0]


@pytest.mark.skipif(not db.ping(), reason="Postgres not reachable")
def test_pg_per_ip_rate_limit(pg_limits, monkeypatch):
    lim, ip = pg_limits
    monkeypatch.setenv("DEMO_RATE_LIMIT_PER_HOUR", "2")
    monkeypatch.setenv("DEMO_MAX_CONCURRENT", "100000")
    for n in range(2):
        r = lim.acquire(ip)
        lim.hold(r, f"demo_pytest{n:05d}{ip[-4:]}")
        lim.release(f"demo_pytest{n:05d}{ip[-4:]}")
    with pytest.raises(demo_api.HTTPException) as exc:
        lim.acquire(ip)
    assert exc.value.status_code == 429 and "Too many" in exc.value.detail
    lim.acquire(ip + "-other")  # a different network is unaffected


@pytest.mark.skipif(not db.ping(), reason="Postgres not reachable")
def test_pg_concurrency_cap_release_and_abandon(pg_limits, monkeypatch):
    lim, prefix = pg_limits
    monkeypatch.setenv("DEMO_RATE_LIMIT_PER_HOUR", "100")
    lim.acquire(prefix + "-warmup")  # creates the table if needed
    with db.get_conn() as conn:
        conn.execute("DELETE FROM demo_slot WHERE ip LIKE %s", (f"{prefix}%",))
    monkeypatch.setenv("DEMO_MAX_CONCURRENT", str(_live_slots() + 2))

    sid = f"demo_pytest_{prefix[-8:]}"
    first = lim.acquire(prefix + "-a")
    lim.hold(first, sid)
    second = lim.acquire(prefix + "-b")
    with pytest.raises(demo_api.HTTPException) as exc:
        lim.acquire(prefix + "-c")
    assert exc.value.status_code == 429 and "busy" in exc.value.detail

    lim.release(sid)        # call ended
    third = lim.acquire(prefix + "-c")
    lim.abandon(second)     # start failed: frees the slot too
    lim.abandon(third)
    lim.acquire(prefix + "-d")
