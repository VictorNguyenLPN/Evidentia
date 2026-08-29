import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from backend.config import MONGODB_URL, MONGODB_DB_NAME, DATA_PATH
from backend.db.connection import MongoConnectionManager
from backend.db.repositories.user_repo import UserRepository
from backend.db.repositories.guest_repo import GuestRepository
from backend.db.repositories.chat_repo import ChatRepository, generate_chat_id
from backend.db.repositories.law_repo import LawRepository
from backend.db.repositories.admin_repo import AdminRepository

logger = logging.getLogger(__name__)

class MongoManager:
    """
    Unified MongoDB Manager Facade for Evidentia.
    Provides 100% backward-compatible API delegating to modular domain repositories.
    """
    def __init__(self, uri: str = MONGODB_URL, db_name: str = MONGODB_DB_NAME):
        self.conn = MongoConnectionManager(uri=uri, db_name=db_name)
        self.user_repo = UserRepository(self.conn)
        self.guest_repo = GuestRepository(self.conn)
        self.chat_repo = ChatRepository(self.conn)
        self.law_repo = LawRepository(self.conn)
        self.admin_repo = AdminRepository(self.conn)

        # Initialize default admin user
        self.user_repo.init_default_user_if_needed()

    # --- Connection Lifecycle ---
    @property
    def uri(self) -> str:
        return self.conn.uri

    @property
    def db_name(self) -> str:
        return self.conn.db_name

    @property
    def _fallback_chats(self) -> Dict[str, Dict[str, Any]]:
        return self.conn._fallback_chats

    @property
    def _fallback_laws(self) -> Dict[str, Dict[str, Any]]:
        return self.conn._fallback_laws

    @property
    def _fallback_articles(self) -> Dict[str, List[Dict[str, Any]]]:
        return self.conn._fallback_articles

    @property
    def _fallback_users(self) -> Dict[str, Dict[str, Any]]:
        return self.conn._fallback_users

    @property
    def _fallback_guest_limits(self) -> Dict[str, int]:
        return self.conn._fallback_guest_limits

    def get_client(self):
        return self.conn.get_client()

    def check_connection(self) -> Dict[str, Any]:
        res = self.conn.check_connection()
        self.user_repo.init_default_user_if_needed()
        return res

    def is_connected(self) -> bool:
        return self.conn.is_connected()

    def get_chats_collection(self):
        return self.conn.get_chats_collection()

    def get_users_collection(self):
        return self.conn.get_users_collection()

    def get_laws_collection(self):
        return self.conn.get_laws_collection()

    def get_articles_collection(self):
        return self.conn.get_articles_collection()

    def get_guest_limits_collection(self):
        return self.conn.get_guest_limits_collection()

    # --- Guest Limits Repository ---
    def get_guest_question_count(self, ip: str) -> int:
        return self.guest_repo.get_guest_question_count(ip)

    def increment_guest_question_count(self, ip: str) -> int:
        return self.guest_repo.increment_guest_question_count(ip)

    def check_guest_limit_exceeded(self, ip: str, max_limit: int = 2) -> bool:
        return self.guest_repo.check_guest_limit_exceeded(ip, max_limit=max_limit)

    def get_all_guest_limits_admin(self) -> List[Dict[str, Any]]:
        return self.guest_repo.get_all_guest_limits_admin()

    def reset_guest_limit_for_ip(self, ip: str) -> bool:
        return self.guest_repo.reset_guest_limit_for_ip(ip)

    def reset_all_guest_limits(self) -> int:
        return self.guest_repo.reset_all_guest_limits()

    def delete_guest_limit_for_ip(self, ip: str) -> bool:
        return self.guest_repo.delete_guest_limit_for_ip(ip)

    # --- User Repository ---
    def init_default_user_if_needed(self):
        return self.user_repo.init_default_user_if_needed()

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.user_repo.get_user_by_email(email)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.user_repo.get_user_by_id(user_id)

    def create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        role: str = "user",
        plan: str = "free",
    ) -> Dict[str, Any]:
        return self.user_repo.create_user(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            plan=plan,
        )

    def update_user_profile(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        avatar: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        return self.user_repo.update_user_profile(user_id, full_name=full_name, avatar=avatar)

    def update_user_password(self, user_id: str, new_password_hash: str) -> bool:
        return self.user_repo.update_user_password(user_id, new_password_hash)

    def get_user_question_count(self, user_id: str) -> int:
        return self.user_repo.get_user_question_count(user_id)

    def increment_user_question_count(self, user_id: str) -> int:
        return self.user_repo.increment_user_question_count(user_id)

    def reset_user_question_count(self, user_id: str) -> bool:
        return self.user_repo.reset_user_question_count(user_id)

    def reset_user_question_count_by_identifier(self, identifier: str) -> bool:
        return self.user_repo.reset_user_question_count_by_identifier(identifier)

    def reset_all_users_question_count(self, plan: Optional[str] = None) -> int:
        return self.user_repo.reset_all_users_question_count(plan=plan)

    def get_user_quotas_admin(
        self,
        query: Optional[str] = None,
        plan: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        return self.user_repo.get_user_quotas_admin(query=query, plan=plan, limit=limit, skip=skip)

    def get_all_users_admin(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        plan: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        return self.user_repo.get_all_users_admin(
            query=query, role=role, plan=plan, limit=limit, skip=skip
        )

    def admin_create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        role: str = "user",
        plan: str = "free",
    ) -> Dict[str, Any]:
        return self.user_repo.admin_create_user(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            plan=plan,
        )

    def admin_update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return self.user_repo.admin_update_user(user_id, updates)

    def admin_delete_user(self, user_id: str, delete_chats: bool = True) -> bool:
        return self.user_repo.admin_delete_user(user_id, delete_chats=delete_chats)

    # --- Chat Repository ---
    def get_all_chats(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.chat_repo.get_all_chats(user_id=user_id)

    def get_chat(self, chat_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        return self.chat_repo.get_chat(chat_id, user_id=user_id)

    def get_chat_with_permission(
        self,
        chat_id: str,
        current_user_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        return self.chat_repo.get_chat_with_permission(chat_id, current_user_id=current_user_id)

    def set_chat_share_status(
        self,
        chat_id: str,
        is_shared: bool,
        user_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        return self.chat_repo.set_chat_share_status(chat_id, is_shared=is_shared, user_id=user_id)

    def save_chat_turn(
        self,
        chat_id: Optional[str],
        query: str,
        answer: str,
        target_date: Optional[str] = None,
        analysis: Optional[Dict[str, Any]] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        steps: Optional[List[Dict[str, Any]]] = None,
        token_usage: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
    ) -> Dict[str, Any]:
        return self.chat_repo.save_chat_turn(
            chat_id=chat_id,
            query=query,
            answer=answer,
            target_date=target_date,
            analysis=analysis,
            citations=citations,
            steps=steps,
            token_usage=token_usage,
            user_id=user_id,
            user_email=user_email,
        )

    def toggle_pin(self, chat_id: str, user_id: Optional[str] = None) -> bool:
        return self.chat_repo.toggle_pin(chat_id, user_id=user_id)

    def delete_chat(self, chat_id: str, user_id: Optional[str] = None) -> bool:
        return self.chat_repo.delete_chat(chat_id, user_id=user_id)

    def clear_all_chats(self, user_id: Optional[str] = None) -> int:
        return self.chat_repo.clear_all_chats(user_id=user_id)

    def rename_chat(self, chat_id: str, new_title: str, user_id: Optional[str] = None) -> bool:
        return self.chat_repo.rename_chat(chat_id, new_title, user_id=user_id)

    def get_all_chats_admin(
        self,
        query: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        return self.chat_repo.get_all_chats_admin(query=query, limit=limit, skip=skip)

    def admin_delete_chat(self, chat_id: str) -> bool:
        return self.chat_repo.admin_delete_chat(chat_id)

    # --- Law Repository ---
    def _structure_law_data(
        self,
        chunks: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        return self.law_repo._structure_law_data(chunks)

    def sync_laws_on_startup(self, data_path: Any = DATA_PATH) -> Dict[str, Any]:
        return self.law_repo.sync_laws_on_startup(data_path=data_path)

    def ingest_laws(self, data_path: Any = DATA_PATH) -> Dict[str, Any]:
        return self.law_repo.ingest_laws(data_path=data_path)

    def get_all_laws(self) -> Dict[str, Any]:
        return self.law_repo.get_all_laws()

    def get_law_detail(self, document_id: str) -> Optional[Dict[str, Any]]:
        return self.law_repo.get_law_detail(document_id)

    def get_law_articles(
        self,
        document_id: str,
        skip: int = 0,
        limit: int = 50,
    ) -> Dict[str, Any]:
        return self.law_repo.get_law_articles(document_id, skip=skip, limit=limit)

    def get_law_article(self, document_id: str, article_number: int) -> Optional[Dict[str, Any]]:
        return self.law_repo.get_law_article(document_id, article_number)

    # --- Admin Repository ---
    def get_admin_overview_stats(self) -> Dict[str, Any]:
        return self.admin_repo.get_admin_overview_stats()

# Singleton Instance
mongo_manager = MongoManager()
