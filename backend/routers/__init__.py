from .status import router as status_router
from .auth import router as auth_router
from .chats import router as chats_router
from .chat_inference import router as chat_inference_router
from .laws import router as laws_router
from .admin import router as admin_router

__all__ = [
    "status_router",
    "auth_router",
    "chats_router",
    "chat_inference_router",
    "laws_router",
    "admin_router",
]
