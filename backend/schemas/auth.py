from typing import Any

from pydantic import BaseModel, Field

from backend.config import get_plan_question_limit


def sanitize_user(user: dict[str, Any]) -> dict[str, Any]:
    """
    Strip sensitive fields like password_hash before returning user data to client.
    Also compute questions_used, questions_limit, questions_remaining, limit_reached.
    """
    safe = dict(user)
    safe.pop("password_hash", None)

    plan = safe.get("plan", "free")
    role = safe.get("role", "user")
    questions_used = int(safe.get("questions_used", 0))
    limit = get_plan_question_limit(plan, role)

    safe["questions_used"] = questions_used
    safe["questions_limit"] = limit
    if limit == -1:
        safe["questions_remaining"] = -1
        safe["limit_reached"] = False
    else:
        safe["questions_remaining"] = max(0, limit - questions_used)
        safe["limit_reached"] = questions_used >= limit

    return safe


class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: str = Field(..., min_length=1, description="Full name")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, min_length=1, description="Full name")
    avatar: str | None = Field(None, description="Avatar image URL or identifier")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (at least 6 characters)")
