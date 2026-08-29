import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query

from backend.config import DATA_PATH, GEMINI_MODEL, PLAN_QUESTION_LIMITS, FREE_PLAN_QUESTION_LIMIT
from backend.db.mongo_manager import mongo_manager
from backend.rag.qdrant_manager import qdrant_manager
from backend.agent.gemini_llm import gemini_client
from backend.rag.embeddings import embedding_service
from backend.rag.hybrid_retriever import hybrid_retriever
from backend.auth import (
    hash_password,
    get_current_admin_user,
)
from backend.schemas.auth import sanitize_user
from backend.schemas.admin import (
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    AdminResetPasswordRequest,
    AdminResetUserQuotaRequest,
    AdminResetAllQuotasRequest,
    AdminResetGuestRequest,
    AdminTestRetrievalRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

# =============================================================================
# OVERVIEW & SYSTEM HEALTH
# =============================================================================

@router.get("/overview")
def get_admin_overview(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Get consolidated KPI statistics and service status for the admin dashboard overview.
    """
    stats = mongo_manager.get_admin_overview_stats()

    qdrant_info: Dict[str, Any] = {
        "configured": qdrant_manager.is_configured(),
        "count": 0,
        "collection": qdrant_manager.collection_name,
    }
    if qdrant_manager.is_configured():
        try:
            qdrant_info["count"] = qdrant_manager.get_collection_count()
            qdrant_info["exists"] = qdrant_manager.collection_exists()
        except Exception as e:
            qdrant_info["error"] = str(e)

    gemini_info = {
        "model": GEMINI_MODEL,
        "ready": gemini_client.is_ready(),
    }

    return {
        "stats": stats,
        "qdrant": qdrant_info,
        "gemini": gemini_info,
        "admin": {
            "id": admin_user.get("id"),
            "email": admin_user.get("email"),
            "full_name": admin_user.get("full_name"),
        },
    }

@router.get("/system/health")
def get_system_health(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Deep health diagnostics of MongoDB, Qdrant Cloud, Gemini LLM, and Embeddings.
    """
    health: Dict[str, Any] = {
        "timestamp": datetime.now().isoformat(),
        "services": {},
    }

    # 1. MongoDB Health
    t0 = time.time()
    mongo_status = mongo_manager.check_connection()
    t_mongo = round((time.time() - t0) * 1000, 2)
    health["services"]["mongodb"] = {
        "name": "MongoDB Database",
        "status": "healthy" if mongo_status.get("connected") else "degraded",
        "latency_ms": t_mongo,
        "details": mongo_status,
    }

    # 2. Qdrant Cloud Health
    t0 = time.time()
    qdrant_configured = qdrant_manager.is_configured()
    qdrant_healthy = False
    q_count = 0
    q_err = None
    if qdrant_configured:
        try:
            qdrant_healthy = qdrant_manager.collection_exists()
            q_count = qdrant_manager.get_collection_count()
        except Exception as e:
            q_err = str(e)
    t_qdrant = round((time.time() - t0) * 1000, 2)

    health["services"]["qdrant"] = {
        "name": "Qdrant Cloud Vector DB",
        "status": "healthy" if qdrant_healthy else ("unconfigured" if not qdrant_configured else "error"),
        "latency_ms": t_qdrant,
        "collection": qdrant_manager.collection_name,
        "points_count": q_count,
        "error": q_err,
    }

    # 3. Gemini LLM Health
    health["services"]["gemini"] = {
        "name": "Google Gemini LLM",
        "model": GEMINI_MODEL,
        "status": "healthy" if gemini_client.is_ready() else "unconfigured",
    }

    # 4. Embeddings Engine
    health["services"]["embeddings"] = {
        "name": "Hybrid Embedding Engine",
        "dense_dimension": embedding_service.get_dense_dimension(),
        "dense_model": getattr(embedding_service, "dense_model_name", "bkai-foundation-models/vietnamese-bi-encoder"),
        "status": "healthy",
    }

    # 5. Local Dataset file
    data_exists = DATA_PATH.exists()
    health["services"]["dataset"] = {
        "name": "Local Dataset File",
        "path": str(DATA_PATH),
        "exists": data_exists,
        "size_bytes": DATA_PATH.stat().st_size if data_exists else 0,
        "status": "healthy" if data_exists else "warning",
    }

    return health

# =============================================================================
# USER MANAGEMENT
# =============================================================================

@router.get("/users")
def list_admin_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    plan: Optional[str] = None,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    List all users with their chat counts, role, plan, and creation dates.
    """
    return mongo_manager.get_all_users_admin(query=query, role=role, plan=plan)

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_admin_user(
    payload: AdminCreateUserRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Create a new user with custom role and subscription plan.
    """
    clean_email = payload.email.strip().lower()
    existing = mongo_manager.get_user_by_email(clean_email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{clean_email}' đã được đăng ký trên hệ thống.",
        )

    pwd_hash = hash_password(payload.password)
    user = mongo_manager.admin_create_user(
        email=clean_email,
        password_hash=pwd_hash,
        full_name=payload.full_name,
        role=payload.role,
        plan=payload.plan,
    )
    return {"message": "Tạo người dùng thành công.", "user": sanitize_user(user)}

@router.put("/users/{user_id}")
def update_admin_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Update user profile, role, and subscription plan.
    """
    target = mongo_manager.get_user_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")

    if user_id == "seed-user-huy-nguyen" and payload.role and payload.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể thay đổi quyền của Quản trị viên mặc định.",
        )

    updates = {k: v for k, v in payload.dict().items() if v is not None}
    updated = mongo_manager.admin_update_user(user_id, updates)
    return {
        "message": "Cập nhật thông tin người dùng thành công.",
        "user": sanitize_user(updated) if updated else None,
    }

@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: str,
    payload: AdminResetPasswordRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Directly set a new password for any user.
    """
    target = mongo_manager.get_user_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")

    new_hash = hash_password(payload.new_password)
    ok = mongo_manager.update_user_password(user_id, new_hash)
    if not ok:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Không thể cập nhật mật khẩu.")
    return {"message": f"Đặt lại mật khẩu cho tài khoản {target.get('email')} thành công."}

@router.delete("/users/{user_id}")
def delete_admin_user(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Delete a user and all their conversation history.
    """
    target = mongo_manager.get_user_by_id(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy người dùng.")

    try:
        ok = mongo_manager.admin_delete_user(user_id, delete_chats=True)
        if not ok:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Không thể xóa người dùng.")
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))

    return {"message": f"Đã xóa tài khoản {target.get('email')} và toàn bộ dữ liệu liên quan."}

@router.get("/users/{user_id}/chats")
def get_user_chats_admin(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Get all chat sessions belonging to a specific user.
    """
    chats = mongo_manager.get_all_chats(user_id=user_id)
    return {"user_id": user_id, "chats": chats, "total": len(chats)}

# =============================================================================
# USER QUESTION QUOTA & LIMIT MANAGEMENT (ALL PLANS)
# =============================================================================

@router.get("/user-limits")
def list_user_limits(
    query: Optional[str] = None,
    plan: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    List user quota tracking records across all plans with usage metrics and computed limits.
    """
    res = mongo_manager.get_user_quotas_admin(query=query, plan=plan, limit=limit, skip=skip)
    return {
        "user_quotas": res.get("user_quotas", []),
        "total": res.get("total", 0),
        "plan_limits": PLAN_QUESTION_LIMITS,
        "default_free_limit": FREE_PLAN_QUESTION_LIMIT,
    }

# Backward compatibility alias for older clients
@router.get("/guest-limits")
def list_guest_limits_compat(
    query: Optional[str] = None,
    plan: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    return list_user_limits(query=query, plan=plan, limit=limit, skip=skip, admin_user=admin_user)

@router.post("/user-limits/reset")
def reset_user_limit(
    payload: AdminResetUserQuotaRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Reset questions_used to 0 for a specific user by user_id or email.
    """
    target = payload.user_id or payload.email
    if not target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng cung cấp 'user_id' hoặc 'email' để đặt lại hạn mức.",
        )

    ok = mongo_manager.reset_user_question_count_by_identifier(target)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy người dùng hoặc không thể reset cho '{target}'.",
        )
    return {"message": f"Đã đặt lại số câu hỏi đã dùng về 0 cho người dùng '{target}'."}

@router.post("/user-limits/reset-all")
def reset_all_user_limits(
    payload: AdminResetAllQuotasRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Reset questions_used to 0 for all users, or users matching a specific plan (e.g. 'free', 'pro', or 'all').
    """
    count = mongo_manager.reset_all_users_question_count(plan=payload.plan)
    plan_desc = f"thuộc gói '{payload.plan}'" if payload.plan and payload.plan != "all" else "toàn hệ thống"
    return {"message": f"Đã đặt lại số câu hỏi về 0 cho {count} người dùng {plan_desc}."}

# Backward compatibility alias for older reset endpoints
@router.post("/guest-limits/reset")
def reset_guest_limits_compat(
    payload: AdminResetGuestRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    if payload.reset_all:
        count = mongo_manager.reset_all_users_question_count(plan=None)
        return {"message": f"Đã đặt lại lượt dùng cho toàn bộ ({count}) người dùng."}
    if payload.ip:
        ok = mongo_manager.reset_user_question_count_by_identifier(payload.ip)
        return {"message": f"Đã đặt lại lượt dùng cho '{payload.ip}'."}
    return {"message": "Đã thực hiện reset."}

@router.delete("/user-limits/{user_id}")
def delete_user_limit(
    user_id: str,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Reset user questions_used back to 0.
    """
    mongo_manager.reset_user_question_count(user_id)
    return {"message": f"Đã đặt lại lượt hỏi của người dùng '{user_id}' về 0."}

# =============================================================================
# VECTOR DB & DATA INGESTION
# =============================================================================

@router.get("/vector/status")
def get_vector_db_status(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Detailed vector database status comparing Qdrant Cloud vs local dataset.
    """
    sync_res = qdrant_manager.sync_data_on_startup(data_path=DATA_PATH)
    return {
        "sync_status": sync_res,
        "collection_name": qdrant_manager.collection_name,
        "qdrant_url_configured": bool(qdrant_manager.url),
        "dense_dimension": embedding_service.get_dense_dimension(),
        "local_data_path": str(DATA_PATH),
        "local_data_exists": DATA_PATH.exists(),
    }

@router.post("/vector/ingest")
def trigger_vector_ingest(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Explicitly trigger full vector embedding generation and upload to Qdrant Cloud.
    """
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tệp dữ liệu không tồn tại tại {DATA_PATH}.",
        )

    try:
        res = qdrant_manager.ingest_dataset(data_path=DATA_PATH)
        return res
    except Exception as e:
        logger.error(f"Error during manual vector ingestion: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quá trình nạp Vector DB thất bại: {str(e)}",
        )

@router.post("/vector/test-retrieval")
def test_vector_retrieval(
    payload: AdminTestRetrievalRequest,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Admin playground to test Hybrid Retrieval (Dense + BM25) directly against Qdrant Cloud.
    """
    t0 = time.time()
    try:
        results = hybrid_retriever.search(
            query=payload.query,
            target_date=payload.target_date,
            top_k=payload.top_k or 5,
        )
        latency_ms = round((time.time() - t0) * 1000, 2)
        return {
            "query": payload.query,
            "target_date": payload.target_date,
            "top_k": payload.top_k,
            "latency_ms": latency_ms,
            "results_count": len(results),
            "results": results,
        }
    except Exception as e:
        logger.error(f"Error in test retrieval: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi thực hiện truy xuất Vector: {str(e)}",
        )

@router.post("/laws/sync")
def trigger_mongo_laws_sync(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Explicitly parse and ingest law metadata & structured articles into MongoDB.
    """
    if not DATA_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tệp dữ liệu không tồn tại tại {DATA_PATH}.",
        )

    try:
        res = mongo_manager.ingest_laws(data_path=DATA_PATH)
        return res
    except Exception as e:
        logger.error(f"Error during MongoDB laws sync: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quá trình đồng bộ MongoDB thất bại: {str(e)}",
        )

@router.get("/laws/preview")
def get_admin_laws_preview(
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Get summary of laws and total articles in MongoDB.
    """
    return mongo_manager.get_all_laws()

# =============================================================================
# GLOBAL CHATS LOG MONITORING
# =============================================================================

@router.get("/chats")
def list_admin_chats(
    query: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    List all chat sessions across users and guests with query previews and message counts.
    """
    return mongo_manager.get_all_chats_admin(query=query, skip=skip, limit=limit)

@router.delete("/chats/{chat_id}")
def delete_admin_chat(
    chat_id: str,
    admin_user: Dict[str, Any] = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Delete any chat session by ID.
    """
    ok = mongo_manager.admin_delete_chat(chat_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phiên chat hoặc không thể xóa.",
        )
    return {"message": f"Đã xóa phiên chat {chat_id}."}
