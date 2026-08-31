from pydantic import BaseModel, Field


class AdminCreateUserRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: str = Field(..., min_length=1, description="Full name")
    role: str = Field("user", description="User role: 'admin', 'user', 'editor'")
    plan: str = Field("free", description="Subscription plan: 'free', 'pro', 'enterprise'")


class AdminUpdateUserRequest(BaseModel):
    full_name: str | None = Field(None, description="Full name")
    email: str | None = Field(None, description="Email address")
    role: str | None = Field(None, description="Role: 'admin', 'user', 'editor'")
    plan: str | None = Field(None, description="Plan: 'free', 'pro', 'enterprise'")


class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, description="New password (at least 6 characters)")


class AdminResetUserQuotaRequest(BaseModel):
    user_id: str | None = Field(None, description="User ID to reset quota")
    email: str | None = Field(None, description="User email to reset quota")


class AdminResetAllQuotasRequest(BaseModel):
    plan: str | None = Field(
        None, description="Filter plan to reset (e.g. 'free', 'pro', or 'all')"
    )


class AdminResetGuestRequest(BaseModel):
    ip: str | None = Field(None, description="Target IP to reset")
    reset_all: bool | None = Field(False, description="Whether to reset all IP quotas")


class AdminTestRetrievalRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Sample legal query")
    top_k: int | None = Field(5, ge=1, le=20, description="Top results count")
    target_date: str | None = Field(None, description="Optional temporal date filter")
