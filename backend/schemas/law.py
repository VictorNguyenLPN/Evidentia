from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class LawDocumentSummary(BaseModel):
    document_id: str
    document_title: str
    doc_identity: Optional[str] = None
    document_type: Optional[str] = None
    issue_date: Optional[str] = None
    effect_date: Optional[str] = None
    expire_date: Optional[str] = None
    effect_status_name: Optional[str] = None
    organ_names: Optional[List[str]] = None
    articles_count: Optional[int] = 0

class LawDetailResponse(BaseModel):
    document: Dict[str, Any]
    structure: Optional[List[Dict[str, Any]]] = None

class ArticleResponse(BaseModel):
    article: Dict[str, Any]
