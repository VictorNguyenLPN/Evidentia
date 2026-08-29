import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Depends

from backend.db.mongo_manager import mongo_manager
from backend.auth import get_optional_current_user
from backend.schemas.chat import ShareChatRequest, RenameChatRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chats", tags=["Chat History"])

@router.get("")
def list_chats(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> List[Dict[str, Any]]:
    if not current_user:
        return []
    user_id = current_user.get("id")
    chats = mongo_manager.get_all_chats(user_id=user_id)
    return chats

@router.get("/{chat_id}")
def get_chat(
    chat_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    requester_id = current_user.get("id") if current_user else None
    chat_doc = mongo_manager.get_chat_with_permission(chat_id, current_user_id=requester_id)
    if not chat_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{chat_id}' not found.",
        )
    return chat_doc

@router.post("/{chat_id}/share")
def set_chat_share(
    chat_id: str,
    payload: ShareChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user.get("id") if current_user else None
    existing = mongo_manager.get_chat(chat_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{chat_id}' not found.",
        )

    if existing.get("user_id") and user_id and existing["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ sở hữu cuộc trò chuyện mới có quyền thay đổi trạng thái chia sẻ.",
        )

    res = mongo_manager.set_chat_share_status(chat_id, is_shared=payload.is_shared, user_id=user_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể cập nhật trạng thái chia sẻ.",
        )
    return res

@router.post("/{chat_id}/pin")
def toggle_chat_pin(
    chat_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user.get("id") if current_user else None
    new_pinned_state = mongo_manager.toggle_pin(chat_id, user_id=user_id)
    return {"id": chat_id, "is_pinned": new_pinned_state, "isPinned": new_pinned_state}

@router.delete("")
def clear_chats(
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user.get("id") if current_user else None
    cleared_count = mongo_manager.clear_all_chats(user_id=user_id)
    return {"status": "success", "cleared_count": cleared_count}

@router.delete("/{chat_id}")
def delete_chat(
    chat_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user.get("id") if current_user else None
    success = mongo_manager.delete_chat(chat_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{chat_id}' not found or could not be deleted.",
        )
    return {"status": "deleted", "id": chat_id}

@router.patch("/{chat_id}/rename")
def rename_chat(
    chat_id: str,
    payload: RenameChatRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user),
) -> Dict[str, Any]:
    user_id = current_user.get("id") if current_user else None
    success = mongo_manager.rename_chat(chat_id, new_title=payload.title, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{chat_id}' not found or cannot be renamed.",
        )
    return {"status": "renamed", "id": chat_id, "title": payload.title.strip()}
