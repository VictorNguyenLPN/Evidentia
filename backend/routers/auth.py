import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

from backend.auth import (
    create_access_token,
    get_current_user,
    get_optional_current_user,
    hash_password,
    verify_password,
)
from backend.db.mongo_manager import mongo_manager
from backend.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    sanitize_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
async def register(payload: RegisterRequest) -> dict[str, Any]:
    clean_email = payload.email.strip().lower()

    existing = mongo_manager.get_user_by_email(clean_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký trên hệ thống.",
        )

    pwd_hash = hash_password(payload.password)
    user_doc = mongo_manager.create_user(
        email=clean_email,
        password_hash=pwd_hash,
        full_name=payload.full_name,
        role="user",
        plan="free",
    )

    token = create_access_token(
        data={
            "sub": user_doc["id"],
            "email": user_doc["email"],
            "role": user_doc["role"],
        }
    )

    return {
        "token": token,
        "user": sanitize_user(user_doc),
        "message": "Đăng ký tài khoản thành công.",
    }


@router.post("/login")
async def login(credentials: LoginRequest) -> dict[str, Any]:
    clean_email = credentials.email.strip().lower()
    user = mongo_manager.get_user_by_email(clean_email)
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác.",
        )

    token = create_access_token(
        data={
            "sub": user["id"],
            "email": user["email"],
            "role": user.get("role", "user"),
        }
    )

    return {
        "token": token,
        "user": sanitize_user(user),
        "message": "Đăng nhập thành công.",
    }


@router.get("/me")
async def get_my_profile(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    return {"user": sanitize_user(current_user)}


@router.put("/profile")
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    updated = mongo_manager.update_user_profile(
        user_id=current_user["id"],
        full_name=payload.full_name,
        avatar=payload.avatar,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể cập nhật thông tin hồ sơ.",
        )
    return {
        "user": sanitize_user(updated),
        "message": "Cập nhật hồ sơ thành công.",
    }


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    full_user = mongo_manager.get_user_by_id(current_user["id"])
    if not full_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy thông tin tài khoản.",
        )

    if not verify_password(payload.current_password, full_user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác.",
        )

    new_hash = hash_password(payload.new_password)
    success = mongo_manager.update_user_password(current_user["id"], new_hash)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi lưu mật khẩu mới.",
        )

    return {"message": "Đổi mật khẩu thành công."}


@router.get("/guest-status")
async def get_guest_status(
    request: Request,
    current_user: dict[str, Any] | None = Depends(get_optional_current_user),
) -> dict[str, Any]:
    if current_user:
        safe_user = sanitize_user(current_user)
        return {
            "authenticated": True,
            "user": safe_user,
            "questions_used": safe_user.get("questions_used", 0),
            "questions_remaining": safe_user.get("questions_remaining", -1),
            "limit_reached": safe_user.get("limit_reached", False),
        }

    return {
        "authenticated": False,
        "questions_used": 0,
        "questions_remaining": 0,
        "remaining": 0,
        "limit_reached": True,
    }
