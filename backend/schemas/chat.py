from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Legal question or inquiry")
    target_date: str | None = Field(
        None, description="Optional temporal constraint in YYYY-MM-DD format"
    )
    top_k: int | None = Field(5, ge=1, le=20, description="Number of top chunks to retrieve")
    chat_id: str | None = Field(None, description="Existing chat session ID to append to")


class ChatResponse(BaseModel):
    query: str
    answer: str
    analysis: dict[str, Any]
    citations: list[dict[str, Any]]
    steps: list[dict[str, Any]]
    token_usage: dict[str, Any] | None = None
    chat_id: str | None = None
    title: str | None = None
    tag: str | None = None
    user_message: dict[str, Any] | None = None
    assistant_message: dict[str, Any] | None = None


class ShareChatRequest(BaseModel):
    is_shared: bool = Field(..., description="Public share status")


class RenameChatRequest(BaseModel):
    title: str = Field(..., min_length=1, description="New title for chat")
