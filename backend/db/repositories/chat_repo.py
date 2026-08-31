import hashlib
import logging
import uuid
from datetime import datetime
from typing import Any

from backend.db.connection import MongoConnectionManager

logger = logging.getLogger(__name__)


def generate_chat_id(email: str = "huy.nguyen@evidentia.vn", dt: datetime | None = None) -> str:
    """
    Generate a 16-character hex hash from user email + timestamp as fallback chat ID.
    """
    if dt is None:
        dt = datetime.now()
    raw = f"{email}::{dt.timestamp()}::{uuid.uuid4().hex[:6]}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


class ChatRepository:
    def __init__(self, conn: MongoConnectionManager):
        self.conn = conn

    @staticmethod
    def _format_relative_time(updated: Any) -> str:
        if not updated:
            return "Vừa xong"
        if isinstance(updated, str):
            try:
                updated = datetime.fromisoformat(updated)
            except Exception:
                return "Vừa xong"
        diff = datetime.now() - updated
        seconds = diff.total_seconds()
        if seconds < 60:
            return "Vừa xong"
        elif seconds < 3600:
            return f"{int(seconds // 60)} phút trước"
        elif seconds < 86400:
            return f"{int(seconds // 3600)} giờ trước"
        elif seconds < 86400 * 7:
            return f"{int(seconds // 86400)} ngày trước"
        else:
            return updated.strftime("%d/%m/%Y")

    def get_all_chats(self, user_id: str | None = None) -> list[dict[str, Any]]:
        """
        List all chat sessions with summary metadata, sorted by pinned and updated_at.
        Filters strictly by user_id for multi-user data isolation.
        """
        if not user_id:
            return []

        col = self.conn.get_chats_collection()
        results: list[dict[str, Any]] = []

        if col is not None:
            try:
                filter_doc: dict[str, Any] = {"user_id": user_id}

                cursor = col.find(
                    filter_doc,
                    {
                        "id": 1,
                        "title": 1,
                        "tag": 1,
                        "is_pinned": 1,
                        "is_shared": 1,
                        "shared_at": 1,
                        "user_id": 1,
                        "created_at": 1,
                        "updated_at": 1,
                    },
                ).sort([("is_pinned", -1), ("updated_at", -1)])

                for doc in cursor:
                    results.append(
                        {
                            "id": doc.get("id"),
                            "title": doc.get("title", "Cuộc trò chuyện mới"),
                            "time": self._format_relative_time(doc.get("updated_at")),
                            "tag": doc.get("tag") or "Pháp luật",
                            "is_pinned": doc.get("is_pinned", False),
                            "isPinned": doc.get("is_pinned", False),
                            "is_shared": doc.get("is_shared", False),
                            "shared_at": doc.get("shared_at").isoformat()
                            if isinstance(doc.get("shared_at"), datetime)
                            else doc.get("shared_at"),
                            "user_id": doc.get("user_id"),
                            "created_at": doc.get("created_at").isoformat()
                            if isinstance(doc.get("created_at"), datetime)
                            else doc.get("created_at"),
                            "updated_at": doc.get("updated_at").isoformat()
                            if isinstance(doc.get("updated_at"), datetime)
                            else doc.get("updated_at"),
                        }
                    )
                return results
            except Exception as e:
                logger.error(f"Error fetching chats from MongoDB: {e}")

        # In-memory fallback
        for chat_id, doc in self.conn._fallback_chats.items():
            if doc.get("user_id") != user_id:
                continue
            results.append(
                {
                    "id": chat_id,
                    "title": doc.get("title", "Cuộc trò chuyện mới"),
                    "time": self._format_relative_time(doc.get("updated_at")),
                    "tag": doc.get("tag") or "Pháp luật",
                    "is_pinned": doc.get("is_pinned", False),
                    "isPinned": doc.get("is_pinned", False),
                    "is_shared": doc.get("is_shared", False),
                    "shared_at": doc.get("shared_at"),
                    "user_id": doc.get("user_id"),
                    "created_at": doc.get("created_at").isoformat()
                    if isinstance(doc.get("created_at"), datetime)
                    else doc.get("created_at"),
                    "updated_at": doc.get("updated_at").isoformat()
                    if isinstance(doc.get("updated_at"), datetime)
                    else doc.get("updated_at"),
                }
            )

        results.sort(key=lambda x: (not x.get("is_pinned", False), x.get("updated_at", "")))
        return results

    def get_chat(self, chat_id: str, user_id: str | None = None) -> dict[str, Any] | None:
        """
        Get full chat session by ID.
        """
        col = self.conn.get_chats_collection()
        if col is not None:
            try:
                filter_doc: dict[str, Any] = {"id": chat_id}
                doc = col.find_one(filter_doc, {"_id": 0})
                if doc:
                    if isinstance(doc.get("created_at"), datetime):
                        doc["created_at"] = doc["created_at"].isoformat()
                    if isinstance(doc.get("updated_at"), datetime):
                        doc["updated_at"] = doc["updated_at"].isoformat()
                    if isinstance(doc.get("shared_at"), datetime):
                        doc["shared_at"] = doc["shared_at"].isoformat()
                    return doc
            except Exception as e:
                logger.error(f"Error retrieving chat {chat_id} from MongoDB: {e}")

        if chat_id in self.conn._fallback_chats:
            doc = dict(self.conn._fallback_chats[chat_id])
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
            if isinstance(doc.get("updated_at"), datetime):
                doc["updated_at"] = doc["updated_at"].isoformat()
            if isinstance(doc.get("shared_at"), datetime):
                doc["shared_at"] = doc["shared_at"].isoformat()
            return doc

        return None

    def get_chat_with_permission(
        self,
        chat_id: str,
        current_user_id: str | None = None,
    ) -> dict[str, Any] | None:
        """
        Retrieve chat session with authorization check:
        - If requester is the owner (or chat has no owner) -> return full chat with is_owner=True.
        - If requester is NOT the owner but is_shared=True -> return chat with is_owner=False.
        - If requester is NOT the owner and is_shared=False -> return {"is_private": True}.
        """
        chat_doc = self.get_chat(chat_id)
        if not chat_doc:
            return None

        chat_owner_id = chat_doc.get("user_id")
        is_shared = bool(chat_doc.get("is_shared", False))

        is_owner = False
        if not chat_owner_id:
            is_owner = True
        elif current_user_id and current_user_id == chat_owner_id:
            is_owner = True

        if is_owner:
            chat_doc["is_owner"] = True
            chat_doc["is_private"] = False
            return chat_doc

        if is_shared:
            chat_doc["is_owner"] = False
            chat_doc["is_private"] = False
            return chat_doc

        return {
            "id": chat_id,
            "is_private": True,
            "is_owner": False,
            "is_shared": False,
            "title": "Cuộc trò chuyện riêng tư",
            "messages": [],
        }

    def set_chat_share_status(
        self,
        chat_id: str,
        is_shared: bool,
        user_id: str | None = None,
    ) -> dict[str, Any] | None:
        """
        Update public share status of a chat.
        """
        col = self.conn.get_chats_collection()
        now = datetime.now()
        shared_at = now if is_shared else None

        existing = self.get_chat(chat_id)
        if not existing:
            return None

        if col is not None:
            try:
                col.update_one(
                    {"id": chat_id},
                    {
                        "$set": {
                            "is_shared": is_shared,
                            "shared_at": shared_at,
                            "updated_at": now,
                        }
                    },
                )
            except Exception as e:
                logger.error(f"Error updating share status in MongoDB for {chat_id}: {e}")

        if chat_id in self.conn._fallback_chats:
            self.conn._fallback_chats[chat_id]["is_shared"] = is_shared
            self.conn._fallback_chats[chat_id]["shared_at"] = shared_at
            self.conn._fallback_chats[chat_id]["updated_at"] = now

        return {
            "id": chat_id,
            "is_shared": is_shared,
            "shared_at": shared_at.isoformat() if isinstance(shared_at, datetime) else shared_at,
        }

    def save_chat_turn(
        self,
        chat_id: str | None,
        query: str,
        answer: str,
        target_date: str | None = None,
        analysis: dict[str, Any] | None = None,
        citations: list[dict[str, Any]] | None = None,
        steps: list[dict[str, Any]] | None = None,
        token_usage: dict[str, Any] | None = None,
        user_id: str | None = None,
        user_email: str | None = None,
    ) -> dict[str, Any]:
        """
        Save or update a chat session with the user prompt and assistant reply.
        """
        col = self.conn.get_chats_collection()
        now = datetime.now()
        timestamp_str = now.strftime("%H:%M")

        user_msg = {
            "id": str(uuid.uuid4()),
            "sender": "user",
            "text": query,
            "timestamp": timestamp_str,
            "targetDate": target_date,
        }

        assistant_msg = {
            "id": str(uuid.uuid4()),
            "sender": "assistant",
            "text": answer,
            "timestamp": timestamp_str,
            "targetDate": target_date,
            "analysis": analysis or {},
            "citations": citations or [],
            "steps": steps or [],
            "token_usage": token_usage or {},
        }

        domain = (analysis or {}).get("domain") or "Pháp luật"
        clean_title = query.strip()

        existing_doc = self.get_chat(chat_id, user_id=user_id) if chat_id else None

        if not chat_id or not existing_doc:
            if not chat_id:
                chat_id = generate_chat_id(email=user_email or "huy.nguyen@evidentia.vn", dt=now)
            new_chat_doc = {
                "id": chat_id,
                "user_id": user_id,
                "title": clean_title,
                "tag": domain,
                "is_pinned": False,
                "is_shared": False,
                "shared_at": None,
                "created_at": now,
                "updated_at": now,
                "messages": [user_msg, assistant_msg],
            }

            self.conn._fallback_chats[chat_id] = new_chat_doc

            if col is not None:
                try:
                    col.insert_one(dict(new_chat_doc))
                except Exception as e:
                    logger.error(f"Failed to insert new chat in MongoDB: {e}")

            return {
                "chat_id": chat_id,
                "title": clean_title,
                "tag": domain,
                "user_message": user_msg,
                "assistant_message": assistant_msg,
            }
        else:
            if col is not None:
                try:
                    col.update_one(
                        {"id": chat_id},
                        {
                            "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
                            "$set": {"updated_at": now},
                        },
                    )
                except Exception as e:
                    logger.error(f"Failed to append messages in MongoDB: {e}")

            if chat_id in self.conn._fallback_chats:
                self.conn._fallback_chats[chat_id]["messages"].extend([user_msg, assistant_msg])
                self.conn._fallback_chats[chat_id]["updated_at"] = now

            return {
                "chat_id": chat_id,
                "title": existing_doc.get("title", clean_title),
                "tag": existing_doc.get("tag", domain),
                "user_message": user_msg,
                "assistant_message": assistant_msg,
            }

    def toggle_pin(self, chat_id: str, user_id: str | None = None) -> bool:
        col = self.conn.get_chats_collection()
        doc = self.get_chat(chat_id, user_id=user_id)
        if not doc:
            return False

        new_status = not doc.get("is_pinned", False)

        if col is not None:
            try:
                col.update_one(
                    {"id": chat_id},
                    {"$set": {"is_pinned": new_status, "updated_at": datetime.now()}},
                )
            except Exception as e:
                logger.error(f"Error toggling pin in MongoDB for {chat_id}: {e}")

        if chat_id in self.conn._fallback_chats:
            self.conn._fallback_chats[chat_id]["is_pinned"] = new_status
            self.conn._fallback_chats[chat_id]["updated_at"] = datetime.now()

        return new_status

    def delete_chat(self, chat_id: str, user_id: str | None = None) -> bool:
        col = self.conn.get_chats_collection()
        if col is not None:
            try:
                filter_doc: dict[str, Any] = {"id": chat_id}
                if user_id:
                    filter_doc["user_id"] = user_id
                col.delete_one(filter_doc)
            except Exception as e:
                logger.error(f"Error deleting chat {chat_id} in MongoDB: {e}")

        if chat_id in self.conn._fallback_chats:
            del self.conn._fallback_chats[chat_id]
            return True

        return True

    def clear_all_chats(self, user_id: str | None = None) -> int:
        col = self.conn.get_chats_collection()
        count = 0
        if col is not None:
            try:
                filter_doc: dict[str, Any] = {}
                if user_id:
                    filter_doc["user_id"] = user_id
                res = col.delete_many(filter_doc)
                count = res.deleted_count
            except Exception as e:
                logger.error(f"Error clearing chats in MongoDB: {e}")

        if user_id:
            keys_to_del = [
                k for k, v in self.conn._fallback_chats.items() if v.get("user_id") == user_id
            ]
            for k in keys_to_del:
                del self.conn._fallback_chats[k]
                count += 1
        else:
            count += len(self.conn._fallback_chats)
            self.conn._fallback_chats.clear()

        return count

    def rename_chat(self, chat_id: str, new_title: str, user_id: str | None = None) -> bool:
        clean_title = new_title.strip()
        if not clean_title:
            return False

        col = self.conn.get_chats_collection()
        now = datetime.now()

        if col is not None:
            try:
                filter_doc: dict[str, Any] = {"id": chat_id}
                if user_id:
                    filter_doc["user_id"] = user_id
                col.update_one(filter_doc, {"$set": {"title": clean_title, "updated_at": now}})
            except Exception as e:
                logger.error(f"Error renaming chat in MongoDB: {e}")

        if chat_id in self.conn._fallback_chats:
            self.conn._fallback_chats[chat_id]["title"] = clean_title
            self.conn._fallback_chats[chat_id]["updated_at"] = now
            return True

        return True

    def get_all_chats_admin(
        self,
        query: str | None = None,
        limit: int = 100,
        skip: int = 0,
    ) -> dict[str, Any]:
        """
        List all chat sessions across the entire system for Admin audit.
        """
        col = self.conn.get_chats_collection()
        filter_doc: dict[str, Any] = {}

        if query and query.strip():
            regex_q = {"$regex": query.strip(), "$options": "i"}
            filter_doc["$or"] = [
                {"title": regex_q},
                {"id": regex_q},
                {"messages.text": regex_q},
            ]

        chats: list[dict[str, Any]] = []
        total = 0

        if col is not None:
            try:
                total = col.count_documents(filter_doc)
                cursor = col.find(filter_doc).sort("updated_at", -1).skip(skip).limit(limit)

                for doc in cursor:
                    messages = doc.get("messages", [])
                    msg_count = len(messages)
                    latest_preview = messages[-1].get("text", "")[:100] if messages else ""

                    user_id = doc.get("user_id")
                    user_email = None
                    user_name = None
                    if user_id:
                        from backend.db.mongo_manager import mongo_manager

                        u = mongo_manager.get_user_by_id(user_id)
                        if u:
                            user_email = u.get("email")
                            user_name = u.get("full_name")

                    chats.append(
                        {
                            "id": doc.get("id"),
                            "title": doc.get("title", "Cuộc trò chuyện mới"),
                            "tag": doc.get("tag") or "Pháp luật",
                            "is_pinned": doc.get("is_pinned", False),
                            "is_shared": doc.get("is_shared", False),
                            "messages_count": msg_count,
                            "latest_preview": latest_preview,
                            "user_id": user_id,
                            "user_email": user_email,
                            "user_name": user_name,
                            "created_at": doc.get("created_at").isoformat()
                            if isinstance(doc.get("created_at"), datetime)
                            else doc.get("created_at"),
                            "updated_at": doc.get("updated_at").isoformat()
                            if isinstance(doc.get("updated_at"), datetime)
                            else doc.get("updated_at"),
                        }
                    )
                return {"chats": chats, "total": total}
            except Exception as e:
                logger.error(f"Error fetching chats for admin from MongoDB: {e}")

        # In-memory fallback
        all_chats = list(self.conn._fallback_chats.values())
        if query and query.strip():
            q_lower = query.strip().lower()
            all_chats = [
                c
                for c in all_chats
                if q_lower in c.get("title", "").lower() or q_lower in c.get("id", "").lower()
            ]

        total = len(all_chats)
        paginated = all_chats[skip : skip + limit]

        for doc in paginated:
            messages = doc.get("messages", [])
            chats.append(
                {
                    "id": doc.get("id"),
                    "title": doc.get("title", "Cuộc trò chuyện mới"),
                    "tag": doc.get("tag") or "Pháp luật",
                    "is_pinned": doc.get("is_pinned", False),
                    "is_shared": doc.get("is_shared", False),
                    "messages_count": len(messages),
                    "latest_preview": messages[-1].get("text", "")[:100] if messages else "",
                    "user_id": doc.get("user_id"),
                    "user_email": None,
                    "user_name": None,
                    "created_at": doc.get("created_at").isoformat()
                    if isinstance(doc.get("created_at"), datetime)
                    else doc.get("created_at"),
                    "updated_at": doc.get("updated_at").isoformat()
                    if isinstance(doc.get("updated_at"), datetime)
                    else doc.get("updated_at"),
                }
            )

        return {"chats": chats, "total": total}

    def admin_delete_chat(self, chat_id: str) -> bool:
        col = self.conn.get_chats_collection()
        if col is not None:
            try:
                col.delete_one({"id": chat_id})
            except Exception as e:
                logger.error(f"Error deleting chat {chat_id} by admin: {e}")
                return False

        self.conn._fallback_chats.pop(chat_id, None)
        return True
