import logging
from typing import Dict, Any
from fastapi import APIRouter

from backend.config import GEMINI_MODEL, QDRANT_COLLECTION_NAME
from backend.rag.qdrant_manager import qdrant_manager
from backend.agent.gemini_llm import gemini_client
from backend.db.mongo_manager import mongo_manager
from backend.schemas.status import SystemStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Status"])

@router.get("/")
def read_root() -> Dict[str, Any]:
    return {
        "app": "Evidentia Legal Assistant Backend",
        "status": "online",
        "description": "Multi-Agent System for Temporal Retrieval and Verification of Vietnamese Legal Documents",
        "endpoints": {
            "chat": "/api/chat",
            "chat_stream": "/api/chat/stream",
            "status": "/api/status",
            "docs": "/docs",
        },
    }

@router.get("/api/status", response_model=SystemStatusResponse)
def get_system_status() -> SystemStatusResponse:
    qdrant_configured = qdrant_manager.is_configured()
    gemini_ready = gemini_client.is_ready()
    mongo_connected = mongo_manager.is_connected()

    return SystemStatusResponse(
        status="healthy" if (qdrant_configured and gemini_ready) else "degraded",
        version="1.0.0",
        gemini_model=GEMINI_MODEL,
        gemini_ready=gemini_ready,
        qdrant_collection=QDRANT_COLLECTION_NAME,
        qdrant_configured=qdrant_configured,
        mongodb_connected=mongo_connected,
    )
