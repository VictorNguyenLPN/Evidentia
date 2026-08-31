from typing import Any

from pydantic import BaseModel


class LawDocumentSummary(BaseModel):
    document_id: str
    document_title: str
    doc_identity: str | None = None
    document_type: str | None = None
    issue_date: str | None = None
    effect_date: str | None = None
    expire_date: str | None = None
    effect_status_name: str | None = None
    organ_names: list[str] | None = None
    articles_count: int | None = 0


class LawDetailResponse(BaseModel):
    document: dict[str, Any]
    structure: list[dict[str, Any]] | None = None


class ArticleResponse(BaseModel):
    article: dict[str, Any]
