from typing import Optional
from pydantic import BaseModel, Field

class AdminCreateUserRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: str = Field(..., min_length=1, description="Full name")
    role: str = Field("user", description="User role: 'admin', 'user', 'editor'")
    plan: str = Field("free", description="Subscription plan: 'free', 'pro', 'enterprise'")

class AdminUpdateUserRequest(BaseModel):
    full_name: Optional[str] = Field(None, description="Full name")
    email: Optional[str] = Field(None, description="Email address")
    role: Optional[str] = Field(None, description="Role: 'admin', 'user', 'editor'")
    plan: Optional[str] = Field(None, description="Plan: 'free', 'pro', 'enterprise'")

class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, description="New password (at least 6 characters)")

class AdminResetUserQuotaRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="User ID to reset quota")
    email: Optional[str] = Field(None, description="User email to reset quota")

class AdminResetAllQuotasRequest(BaseModel):
    plan: Optional[str] = Field(None, description="Filter plan to reset (e.g. 'free', 'pro', or 'all')")

class AdminResetGuestRequest(BaseModel):
    ip: Optional[str] = Field(None, description="Target IP to reset")
    reset_all: Optional[bool] = Field(False, description="Whether to reset all IP quotas")

class AdminTestRetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Sample legal query")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Top results count")
    target_date: Optional[str] = Field(None, description="Optional temporal date filter")
