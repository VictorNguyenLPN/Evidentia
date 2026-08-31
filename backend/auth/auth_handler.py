import logging
from datetime import UTC, datetime, timedelta
from typing import Any

# pyrefly: ignore [missing-import]
import bcrypt

# pyrefly: ignore [missing-import]
import jwt

# pyrefly: ignore [missing-import]
from fastapi import Depends, HTTPException, status

# pyrefly: ignore [missing-import]
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)

logger = logging.getLogger(__name__)

security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    """
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plaintext password against bcrypt hashed password.
    """
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token containing claims.
    If expires_delta is provided or ACCESS_TOKEN_EXPIRE_MINUTES > 0, an 'exp' claim is set.
    If ACCESS_TOKEN_EXPIRE_MINUTES <= 0 (or 0) and expires_delta is None, the token never expires.
    """
    to_encode = data.copy()
    now_utc = datetime.now(UTC)
    to_encode.update({"iat": now_utc})

    if expires_delta is not None and expires_delta.total_seconds() > 0:
        expire = now_utc + expires_delta
        to_encode["exp"] = expire
    elif ACCESS_TOKEN_EXPIRE_MINUTES > 0:
        expire = now_utc + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode["exp"] = expire

    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT access token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("JWT Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT Token: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_bearer),
) -> dict[str, Any]:
    """
    FastAPI dependency for strictly requiring an authenticated user.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực tài khoản. Vui lòng đăng nhập.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã định danh người dùng trong token không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from backend.db.mongo_manager import mongo_manager

    user = mongo_manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại hoặc đã bị vô hiệu hóa.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_bearer),
) -> dict[str, Any] | None:
    """
    FastAPI dependency for optional authentication.
    Returns user dict if valid Bearer token provided, else None.
    """
    if not credentials or not credentials.credentials:
        return None

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        from backend.db.mongo_manager import mongo_manager

        return mongo_manager.get_user_by_id(user_id)
    except Exception as e:
        logger.error(f"Error fetching user in optional auth: {e}")
        return None


async def get_current_admin_user(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """
    FastAPI dependency that requires an authenticated user with 'admin' role.
    """
    role = current_user.get("role", "user")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối. Yêu cầu quyền Quản trị viên (Admin).",
        )
    return current_user
