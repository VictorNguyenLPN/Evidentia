import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.config import (
    DATA_PATH,
    QDRANT_COLLECTION_NAME,
    GEMINI_MODEL,
    HOST,
    PORT
)
from backend.rag.qdrant_manager import qdrant_manager
from backend.agent.agentic_rag import legal_agentic_rag
from backend.agent.gemini_llm import gemini_client

import sys

import logging.config

# Custom Colored Log Formatter
class ColoredFormatter(logging.Formatter):
    RESET = "\033[0m"
    RED = "\033[91m"
    BOLD_RED = "\033[1;91m"
    ORANGE = "\033[38;5;208m"
    GREEN = "\033[92m"
    CYAN = "\033[96m"

    def format(self, record: logging.LogRecord) -> str:
        record_copy = logging.makeLogRecord(record.__dict__)
        levelno = record_copy.levelno

        if levelno >= logging.CRITICAL:
            color = self.BOLD_RED
        elif levelno >= logging.ERROR:
            color = self.RED
        elif levelno >= logging.WARNING:
            color = self.ORANGE
        elif levelno >= logging.INFO:
            color = self.GREEN
        elif levelno >= logging.DEBUG:
            color = self.CYAN
        else:
            color = self.RESET

        record_copy.levelname = f"{color}{record_copy.levelname}{self.RESET}"
        return super().format(record_copy)

UVICORN_LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": ColoredFormatter,
            "fmt": "%(asctime)s [%(levelname)s]  %(filename)s:%(lineno)d  %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "access": {
            "()": ColoredFormatter,
            "fmt": "%(asctime)s [%(levelname)s]  %(filename)s:%(lineno)d  %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "": {"handlers": ["default"], "level": "INFO"},
        "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.error": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
        "fastapi": {"handlers": ["default"], "level": "INFO", "propagate": False},
        "httpx": {"handlers": ["default"], "level": "WARNING", "propagate": False},
        "httpcore": {"handlers": ["default"], "level": "WARNING", "propagate": False},
    },
}

def setup_unified_logging():
    """
    Configure unified logging with Datetime and Colors across Root, Backend, and Uvicorn loggers.
    """
    logging.config.dictConfig(UVICORN_LOGGING_CONFIG)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

setup_unified_logging()

logger = logging.getLogger("evidentia.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan handler.
    Strictly performs connection, status, and count checks on startup (Warning only, no auto-ingest).
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
    lifespan=lifespan
)

# Enable CORS for Frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.db.mongo_manager import mongo_manager

# Request / Response Schemas
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Legal question or inquiry")
    target_date: Optional[str] = Field(None, description="Optional temporal constraint in YYYY-MM-DD format")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Number of top chunks to retrieve")
    chat_id: Optional[str] = Field(None, description="Existing chat session ID to append to")

class ChatResponse(BaseModel):
    query: str
    answer: str
    analysis: Dict[str, Any]
    citations: List[Dict[str, Any]]
    steps: List[Dict[str, Any]]
    chat_id: Optional[str] = None
    title: Optional[str] = None
    tag: Optional[str] = None
    user_message: Optional[Dict[str, Any]] = None
    assistant_message: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    return {"message": "Welcome to the Evidentia' API Service!"}

@app.get("/api/status")
def system_status():
    """
    Check backend connection status with Qdrant Cloud, Gemini, and MongoDB.
    """
    qdrant_ok = False
    cloud_count = 0
    qdrant_err = None

    try:
        if qdrant_manager.is_configured():
            cloud_count = qdrant_manager.get_collection_count()
            qdrant_ok = True
    except Exception as e:
        qdrant_err = str(e)

    return {
        "status": "ready" if (qdrant_ok and gemini_client.is_configured()) else "attention_required",
        "gemini": {
            "configured": gemini_client.is_configured(),
            "model": GEMINI_MODEL
        },
        "qdrant": {
            "configured": qdrant_manager.is_configured(),
            "connected": qdrant_ok,
            "collection": QDRANT_COLLECTION_NAME,
            "cloud_count": cloud_count,
            "error": qdrant_err
        },
        "mongodb": {
            "connected": mongo_manager.is_connected(),
            "database": mongo_manager.db_name
        },
        "data_path": str(DATA_PATH)
    }

@app.get("/api/chats")
def list_chats():
    """
    Retrieve list of all chat sessions stored in MongoDB.
    """
    return mongo_manager.get_all_chats()

@app.get("/api/chats/{chat_id}")
def get_chat_detail(chat_id: str):
    """
    Retrieve full conversation messages for a specific chat ID.
    """
    chat_doc = mongo_manager.get_chat(chat_id)
    if not chat_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{chat_id}' not found."
        )
    return chat_doc

@app.post("/api/chats/{chat_id}/pin")
def toggle_chat_pin(chat_id: str):
    """
    Toggle pin/unpin status of a chat session in MongoDB.
    """
    new_pinned = mongo_manager.toggle_pin(chat_id)
    return {"id": chat_id, "is_pinned": new_pinned}

class RenameChatRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="New title for chat session")

@app.delete("/api/chats/{chat_id}")
def delete_chat_session(chat_id: str):
    """
    Delete a chat session from MongoDB.
    """
    success = mongo_manager.delete_chat(chat_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or already deleted."
        )
    return {"success": True, "id": chat_id}

@app.patch("/api/chats/{chat_id}/rename")
def rename_chat_session(chat_id: str, payload: RenameChatRequest):
    """
    Rename a chat session title in MongoDB or fallback storage.
    """
    success = mongo_manager.rename_chat(chat_id, payload.title)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found or rename failed."
        )
    return {"success": True, "id": chat_id, "title": payload.title.strip()}
    
@app.get("/api/laws")
def get_laws_overview():
    """
    Retrieve list of all legal documents with overall statistics.
    """
    return mongo_manager.get_all_laws()

@app.get("/api/laws/{document_id}")
def get_law_metadata_and_toc(document_id: str):
    """
    Retrieve specific law document metadata and chapter table of contents.
    """
    law = mongo_manager.get_law_detail(document_id)
    if not law:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Law document '{document_id}' not found."
        )
    return law

@app.get("/api/laws/{document_id}/articles")
def get_law_articles(
    document_id: str,
    chapter_number: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """
    Retrieve paginated list of articles for infinite scroll / lazy loading.
    """
    return mongo_manager.get_law_articles(
        document_id=document_id,
        chapter_number=chapter_number,
        search=search,
        page=page,
        limit=limit
    )

@app.get("/api/laws/{document_id}/articles/{article_number}")
def get_law_article(document_id: str, article_number: int):
    """
    Retrieve single article details.
    """
    art = mongo_manager.get_law_article(document_id, article_number)
    if not art:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Article {article_number} in document '{document_id}' not found."
        )
    return art


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    """
    Main Agentic-RAG Chat Endpoint.
    Performs Query Analysis -> Hybrid Retrieval on Qdrant Cloud -> Legal Citations Grounding -> Persists in MongoDB.
    """
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )

    try:
        response_data = legal_agentic_rag.run(
            query=payload.query.strip(),
            target_date=payload.target_date,
            top_k=payload.top_k or 5
        )
        
        # Persist conversation turn in MongoDB
        save_res = mongo_manager.save_chat_turn(
            chat_id=payload.chat_id,
            query=payload.query.strip(),
            answer=response_data["answer"],
            target_date=payload.target_date,
            analysis=response_data.get("analysis"),
            citations=response_data.get("citations"),
            steps=response_data.get("steps")
        )
        
        response_data["chat_id"] = save_res.get("chat_id")
        response_data["title"] = save_res.get("title")
        response_data["tag"] = save_res.get("tag")
        response_data["user_message"] = save_res.get("user_message")
        response_data["assistant_message"] = save_res.get("assistant_message")

        return response_data
    except Exception as e:
        logger.error(f"Error processing chat query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing Legal Agentic-RAG pipeline: {str(e)}"
        )

if __name__ == "__main__":
    import argparse
    from pathlib import Path
    # pyrefly: ignore [missing-import]
    import uvicorn

    parser = argparse.ArgumentParser(description="Evidentia Legal Agentic-RAG API Service")
    parser.add_argument("--host", type=str, default=HOST, help=f"Host interface to bind (default: {HOST})")
    parser.add_argument("--port", type=int, default=PORT, help=f"Port to bind (default: {PORT})")
    parser.add_argument("--reload", action="store_true", default=True, help="Enable auto-reload on code changes")
    parser.add_argument("--no-reload", dest="reload", action="store_false", help="Disable auto-reload")
    parser.add_argument(
        "--ingest-qdrant",
        action="store_true",
        help="Explicitly encode and ingest local dataset chunks into Qdrant Cloud"
    )
    parser.add_argument(
        "--sync-mongo", "--ingest-mongo",
        action="store_true",
        dest="sync_mongo",
        help="Explicitly parse and ingest/update law metadata and structured articles into MongoDB"
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default=str(DATA_PATH),
        help=f"Path to raw data JSON file (default: {DATA_PATH})"
    )

    args, unknown = parser.parse_known_args()

    data_file = Path(args.data_path) if args.data_path else DATA_PATH

    # 1. Handle explicit Qdrant ingestion flag
    if args.ingest_qdrant:
        logger.info(f"CLI Trigger: Ingesting dataset into Qdrant Cloud from {data_file}...")
        try:
            res_q = qdrant_manager.ingest_dataset(data_path=data_file)
            logger.info(f"Qdrant Ingestion Finished: {res_q.get('message')}")
        except Exception as e:
            logger.error(f"Failed to ingest to Qdrant Cloud: {e}", exc_info=True)
            sys.exit(1)

    # 2. Handle explicit MongoDB ingestion/sync flag
    if args.sync_mongo:
        logger.info(f"CLI Trigger: Updating laws and metadata into MongoDB from {data_file}...")
        try:
            res_m = mongo_manager.ingest_laws(data_path=data_file)
            logger.info(f"MongoDB Ingestion Finished: {res_m.get('message')}")
        except Exception as e:
            logger.error(f"Failed to update MongoDB: {e}", exc_info=True)
            sys.exit(1)

    # Launch Uvicorn dev server
    uvicorn.run("backend.main:app", host=args.host, port=args.port, reload=args.reload, log_config=UVICORN_LOGGING_CONFIG)

