from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

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
    token_usage: Optional[Dict[str, Any]] = None
    chat_id: Optional[str] = None
    title: Optional[str] = None
    tag: Optional[str] = None
    user_message: Optional[Dict[str, Any]] = None
    assistant_message: Optional[Dict[str, Any]] = None

class ShareChatRequest(BaseModel):
    is_shared: bool = Field(..., description="Public share status")

class RenameChatRequest(BaseModel):
    title: str = Field(..., min_length=1, description="New title for chat")
