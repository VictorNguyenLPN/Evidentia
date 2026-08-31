from typing import Any

from pydantic import BaseModel


class SystemStatusResponse(BaseModel):
    status: str
    version: str
    gemini_model: str
    gemini_ready: bool
    qdrant_collection: str
    qdrant_configured: bool
    mongodb_connected: bool


class ServiceHealthInfo(BaseModel):
    status: str
    message: str | None = None
    latency_ms: float | None = None
    details: dict[str, Any] | None = None


class SystemHealthResponse(BaseModel):
    status: str
    timestamp: str
    services: dict[str, Any]
