import logging
import logging.config
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import (
    DATA_PATH,
    HOST,
    PORT,
)
from backend.utils.logging import UVICORN_LOGGING_CONFIG
from backend.rag.qdrant_manager import qdrant_manager
from backend.agent.gemini_llm import gemini_client
from backend.db.mongo_manager import mongo_manager

# Routers
from backend.routers import (
    status_router,
    auth_router,
    chats_router,
    chat_inference_router,
    laws_router,
    admin_router,
)

# Configure unified logging across root, application, and uvicorn
logging.config.dictConfig(UVICORN_LOGGING_CONFIG)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

logger = logging.getLogger("evidentia.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan handler.
    Performs connection verification and collection status checks on startup.
    Data ingestion is only executed via explicit CLI flags (--ingest-qdrant, --sync-mongo).
    """
    print("")
    logger.info(f"Local Data File: {DATA_PATH}")

    # 1. Verify Gemini LLM readiness
    gemini_client.check_readiness()

    # 2. Check Qdrant Cloud collection status (verification only)
    try:
        qdrant_manager.sync_data_on_startup(data_path=DATA_PATH)
    except Exception as e:
        logger.error(f"Failed to check Qdrant Cloud status on startup: {e}", exc_info=True)

    # 3. Check MongoDB connection & laws status (verification only)
    mongo_manager.check_connection()
    try:
        mongo_manager.sync_laws_on_startup(data_path=DATA_PATH)
    except Exception as e:
        logger.error(f"Failed to check MongoDB laws status on startup: {e}", exc_info=True)

    print("")
    yield
    print("")

app = FastAPI(
    title="Evidentia Legal Agentic-RAG API",
    description="Agentic System for Temporal Retrieval and Verification of Vietnamese Legal Documents",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Domain Routers
app.include_router(status_router)
app.include_router(auth_router)
app.include_router(chats_router)
app.include_router(chat_inference_router)
app.include_router(laws_router)
app.include_router(admin_router)

if __name__ == "__main__":
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser(description="Evidentia Legal Agentic-RAG API Service")
    parser.add_argument("--host", type=str, default=HOST, help=f"Host interface to bind (default: {HOST})")
    parser.add_argument("--port", type=int, default=PORT, help=f"Port to bind (default: {PORT})")
    parser.add_argument("--reload", action="store_true", default=True, help="Enable auto-reload on code changes")
    parser.add_argument("--no-reload", dest="reload", action="store_false", help="Disable auto-reload")
    parser.add_argument(
        "--ingest-qdrant",
        action="store_true",
        help="Explicitly create collection and ingest dataset into Qdrant Cloud on startup",
    )
    parser.add_argument(
        "--sync-mongo",
        action="store_true",
        help="Explicitly structure and sync legal documents into MongoDB on startup",
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default=str(DATA_PATH),
        help=f"Custom path to legal chunks JSON file (default: {DATA_PATH})",
    )

    args = parser.parse_args()
    data_path_override = Path(args.data_path)

    if args.ingest_qdrant:
        logger.info(f"CLI trigger: Ingesting dataset into Qdrant Cloud from {data_path_override}...")
        try:
            res = qdrant_manager.ingest_dataset(data_path=data_path_override)
            logger.info(f"Qdrant Ingest Result: {res}")
        except Exception as e:
            logger.error(f"Failed to ingest Qdrant dataset: {e}", exc_info=True)
            sys.exit(1)

    if args.sync_mongo:
        logger.info(f"CLI trigger: Syncing legal structure to MongoDB from {data_path_override}...")
        try:
            res = mongo_manager.ingest_laws(data_path=data_path_override)
            logger.info(f"MongoDB Laws Sync Result: {res}")
        except Exception as e:
            logger.error(f"Failed to sync laws into MongoDB: {e}", exc_info=True)
            sys.exit(1)

    uvicorn.run(
        "backend.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_config=UVICORN_LOGGING_CONFIG,
    )
