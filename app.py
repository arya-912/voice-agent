"""Vercel entrypoint — re-exports the FastAPI app from metrics/app.py.

Locally, keep using:  uvicorn metrics.app:app --port 8000
"""
from metrics.app import app  # noqa: F401
