"""Per-turn latency log: how long the customer sits in silence between
finishing a sentence and hearing the agent's voice.

Gemini Live detects end-of-turn on its own servers and never tells the
client when the customer stopped talking, so that moment is measured here
from the energy of the audio frames the session already receives. No extra
LiveKit stream/resampler is created: native objects opened alongside the
plugin's own coincided with a segfault in liblivekit_ffi on a live call.
"""
from __future__ import annotations

import logging
import time

import numpy as np
from livekit import rtc
from livekit.agents.voice import io

logger = logging.getLogger("voice.turns")

_MIN_VOICE_RMS = 500.0   # int16; phone-line hiss sits well below this
_FLOOR_MULTIPLIER = 4.0  # voice = this many times the running noise floor


class _FrameTap(io.AudioInput):
    def __init__(self, source: io.AudioInput, on_frame) -> None:
        super().__init__(label="TurnTimer", source=source)
        self._on_frame = on_frame

    async def __anext__(self) -> rtc.AudioFrame:
        frame = await super().__anext__()
        self._on_frame(frame)
        return frame


class TurnTimer:
    def __init__(self, session) -> None:
        self._session = session
        self._noise_floor = _MIN_VOICE_RMS / _FLOOR_MULTIPLIER
        self._last_voice: float | None = None
        self._spoke_since_agent = False
        self._transcript_at: float | None = None
        self._turn = 0
        session.on("agent_state_changed", self._on_agent_state)
        session.on("user_input_transcribed", self._on_transcript)
        session.on("metrics_collected", self._on_metrics)

    def attach(self) -> None:
        """Call after session.start(), once RoomIO has set the audio input."""
        if self._session.input.audio is not None:
            self._session.input.audio = _FrameTap(self._session.input.audio, self._on_frame)

    def _on_frame(self, frame: rtc.AudioFrame) -> None:
        samples = np.frombuffer(frame.data, dtype=np.int16).astype(np.float32)
        if not samples.size:
            return
        rms = float(np.sqrt(np.mean(samples * samples)))
        if rms > max(_MIN_VOICE_RMS, self._noise_floor * _FLOOR_MULTIPLIER):
            self._last_voice = time.time()
            self._spoke_since_agent = True
        elif rms < self._noise_floor:
            self._noise_floor = rms
        else:
            self._noise_floor *= 1.001  # drift up slowly if the line gets noisier

    def _on_transcript(self, ev) -> None:
        if getattr(ev, "is_final", False):
            self._transcript_at = time.time()

    def _on_metrics(self, ev) -> None:
        m = ev.metrics
        if getattr(m, "type", "") == "realtime_model_metrics":
            logger.info("gemini response: first audio %.2fs after response start, %.2fs total",
                        m.ttft, m.duration)

    def _on_agent_state(self, ev) -> None:
        if ev.new_state != "speaking":
            return
        now = time.time()
        if self._spoke_since_agent and self._last_voice:
            self._turn += 1
            transcript = (
                f"{self._transcript_at - self._last_voice:+.2f}s"
                if self._transcript_at and self._transcript_at > self._last_voice else "n/a"
            )
            logger.info("turn %d: customer silent %.2fs before agent voice | gemini transcript %s",
                        self._turn, now - self._last_voice, transcript)
        self._spoke_since_agent = False
        self._transcript_at = None
