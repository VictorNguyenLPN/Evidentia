from typing import Optional, Dict, Any
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
    message: Optional[str] = None
    latency_ms: Optional[float] = None
    details: Optional[Dict[str, Any]] = None

class SystemHealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, Any]
