# The voice worker image LiveKit Cloud builds and runs (`lk agent create` /
# `lk agent deploy`). LiveKit Cloud injects LIVEKIT_URL / LIVEKIT_API_KEY /
# LIVEKIT_API_SECRET; the rest (GOOGLE_API_KEY, DATABASE_URL, ...) are
# agent secrets.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# requirements.lock pins requirements-agent.txt; regenerate it with the
# command at its top whenever that file changes.
COPY requirements.lock ./
RUN pip install --no-cache-dir -r requirements.lock

COPY . .
RUN python -m voice.agent download-files

CMD ["python", "-m", "voice.agent", "start"]
