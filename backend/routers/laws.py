import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from backend.db.mongo_manager import mongo_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/laws", tags=["Laws Database"])


@router.get("")
def list_laws() -> dict[str, Any]:
    return mongo_manager.get_all_laws()


@router.get("/{document_id}")
def get_law_detail(document_id: str) -> dict[str, Any]:
    doc = mongo_manager.get_law_detail(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Văn bản pháp luật '{document_id}' không tồn tại.",
        )
    return doc


@router.get("/{document_id}/articles")
def list_law_articles(
    document_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    return mongo_manager.get_law_articles(document_id=document_id, skip=skip, limit=limit)


@router.get("/{document_id}/articles/{article_number}")
def get_law_article(document_id: str, article_number: int) -> dict[str, Any]:
    art = mongo_manager.get_law_article(document_id=document_id, article_number=article_number)
    if not art:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Điều {article_number} trong văn bản '{document_id}' không tồn tại.",
        )
    return art
