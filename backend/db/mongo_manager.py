import base64
import hashlib
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

# pyrefly: ignore [missing-import]
import certifi
# pyrefly: ignore [missing-import]
import pymongo
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from pymongo.collection import Collection

from backend.config import MONGODB_URL, MONGODB_DB_NAME

logger = logging.getLogger(__name__)

def generate_chat_id(email: str = "huy.nguyen@evidentia.vn", dt: Optional[datetime] = None) -> str:
    """
    Generate a 16-character hex hash from user email + timestamp as fallback chat ID.
    """
    if dt is None:
        dt = datetime.now()
    raw = f"{email}::{dt.timestamp()}::{uuid.uuid4().hex[:6]}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]

class MongoManager:
    """
    MongoDB Manager for persisting legal chat sessions, message histories, citations, and pinned status.
    Includes in-memory fallback for seamless offline operation.
    """
    def __init__(self, uri: str = MONGODB_URL, db_name: str = MONGODB_DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self._client: Optional[MongoClient] = None
        self._connected: Optional[bool] = None
        self._fallback_chats: Dict[str, Dict[str, Any]] = {}

    def get_client(self) -> Optional[MongoClient]:
        if self._client is None and self.uri and self._connected is not False:
            try:
                self._client = MongoClient(
                    self.uri,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=3000,
                    connectTimeoutMS=3000
                )
                self._client.admin.command("ping")
                self._connected = True
            except Exception:
                self._connected = False
                self._client = None
        return self._client

    def check_connection(self) -> Dict[str, Any]:
        """
        Verify MongoDB connection during lifespan startup and log clear diagnostics.
        """
        if not self.uri:
            logger.warning("MONGODB_URL is not configured in .env. Chat history will operate in fallback mode.")
            return {"connected": False, "error": "unconfigured"}

        logger.info(f"Connecting to MongoDB at {self.uri}...")
        try:
            self._client = MongoClient(
                self.uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000
            )
            self._client.admin.command("ping")
            self._connected = True
            logger.info(f"MongoDB is connected (database = '{self.db_name}'). Ready.")
            return {"connected": True, "database": self.db_name}
        except Exception as e:
            self._connected = False
            self._client = None
            err_msg = str(e)
            if "TLSV1_ALERT_INTERNAL_ERROR" in err_msg or "SSL" in err_msg:
                logger.warning(
                    f"MongoDB connection failed: {e}\n"
                )
            else:
                logger.warning(f"MongoDB connection failed: {e}. Chat history will operate in fallback mode.")
            return {"connected": False, "error": err_msg}

    def is_connected(self) -> bool:
        if self._connected is None:
            self.check_connection()
        return bool(self._connected)

    def get_chats_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["chats"]
        return None

    @staticmethod
    def _format_relative_time(updated: Any) -> str:
        if isinstance(updated, str):
            try:
                updated = datetime.fromisoformat(updated)
            except Exception:
                return "Vừa xong"

        if isinstance(updated, datetime):
            now = datetime.now()
            diff = now - updated
            if diff.days == 0:
                if diff.seconds < 3600:
                    mins = max(1, diff.seconds // 60)
                    return f"{mins} phút trước"
                else:
                    return updated.strftime("%H:%M")
            elif diff.days == 1:
                return "Hôm qua"
            else:
                return f"{diff.days} ngày trước"
        return "Vừa xong"

    def get_all_chats(self) -> List[Dict[str, Any]]:
        """
        Get all chat sessions sorted by pinned status and updated_at descending.
        """
        col = self.get_chats_collection()
        if col is not None:
            try:
                cursor = col.find({}, {
                    "id": 1,
                    "title": 1,
                    "tag": 1,
                    "is_pinned": 1,
                    "created_at": 1,
                    "updated_at": 1,
                    "_id": 0
                }).sort([("is_pinned", pymongo.DESCENDING), ("updated_at", pymongo.DESCENDING)])
                
                chats = []
                for doc in cursor:
                    chats.append({
                        "id": doc.get("id"),
                        "title": doc.get("title", "Đoạn chat mới"),
                        "tag": doc.get("tag", "Pháp luật"),
                        "isPinned": bool(doc.get("is_pinned", False)),
                        "time": self._format_relative_time(doc.get("updated_at"))
                    })
                return chats
            except Exception as e:
                logger.error(f"Error fetching chats from MongoDB: {e}")

        # Fallback in-memory list
        sorted_fallback = sorted(
            self._fallback_chats.values(),
            key=lambda c: (c.get("is_pinned", False), c.get("updated_at") or datetime.min),
            reverse=True
        )
        return [
            {
                "id": doc.get("id"),
                "title": doc.get("title", "Đoạn chat mới"),
                "tag": doc.get("tag", "Pháp luật"),
                "isPinned": bool(doc.get("is_pinned", False)),
                "time": self._format_relative_time(doc.get("updated_at"))
            }
            for doc in sorted_fallback
        ]

    def get_chat(self, chat_id: str) -> Optional[Dict[str, Any]]:
        """
        Get full chat session including all messages.
        """
        col = self.get_chats_collection()
        if col is not None:
            try:
                doc = col.find_one({"id": chat_id}, {"_id": 0})
                if doc:
                    if isinstance(doc.get("created_at"), datetime):
                        doc["created_at"] = doc["created_at"].isoformat()
                    if isinstance(doc.get("updated_at"), datetime):
                        doc["updated_at"] = doc["updated_at"].isoformat()
                    return doc
            except Exception as e:
                logger.error(f"Error getting chat {chat_id} from MongoDB: {e}")

        # Fallback lookup
        fallback_doc = self._fallback_chats.get(chat_id)
        if fallback_doc:
            copied = dict(fallback_doc)
            if isinstance(copied.get("created_at"), datetime):
                copied["created_at"] = copied["created_at"].isoformat()
            if isinstance(copied.get("updated_at"), datetime):
                copied["updated_at"] = copied["updated_at"].isoformat()
            return copied
        return None

    def save_chat_turn(
        self,
        chat_id: Optional[str],
        query: str,
        answer: str,
        target_date: Optional[str] = None,
        analysis: Optional[Dict[str, Any]] = None,
        citations: Optional[List[Dict[str, Any]]] = None,
        steps: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Save or update a chat session with the user prompt and assistant reply.
        Uses the first user query as the persistent chat title and encodes title+datetime as the chat ID/path.
        """
        col = self.get_chats_collection()
        now = datetime.now()
        timestamp_str = now.strftime("%H:%M")
        
        # User message
        user_msg = {
            "id": str(uuid.uuid4()),
            "sender": "user",
            "text": query,
            "timestamp": timestamp_str,
            "targetDate": target_date
        }
        
        # Assistant message
        assistant_msg = {
            "id": str(uuid.uuid4()),
            "sender": "assistant",
            "text": answer,
            "timestamp": timestamp_str,
            "targetDate": target_date,
            "analysis": analysis or {},
            "citations": citations or [],
            "steps": steps or []
        }

        domain = (analysis or {}).get("domain") or "Pháp luật"
        clean_title = query.strip()

        # Check if chat exists
        existing_doc = self.get_chat(chat_id) if chat_id else None

        if not chat_id or not existing_doc:
            # First turn: use provided chat_id or generate from email + timestamp
            if not chat_id:
                chat_id = generate_chat_id(email="huy.nguyen@evidentia.vn", dt=now)
            new_chat_doc = {
                "id": chat_id,
                "title": clean_title,
                "tag": domain,
                "is_pinned": False,
                "created_at": now,
                "updated_at": now,
                "messages": [user_msg, assistant_msg]
            }

            self._fallback_chats[chat_id] = new_chat_doc

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
                "assistant_message": assistant_msg
            }
        else:
            # Subsequent turns: retain original title from the first question
            existing_title = existing_doc.get("title") or clean_title
            
            # Update fallback
            if chat_id in self._fallback_chats:
                self._fallback_chats[chat_id]["updated_at"] = now
                self._fallback_chats[chat_id]["messages"].extend([user_msg, assistant_msg])

            if col is not None:
                try:
                    col.update_one(
                        {"id": chat_id},
                        {
                            "$set": {"updated_at": now},
                            "$push": {"messages": {"$each": [user_msg, assistant_msg]}}
                        },
                        upsert=True
                    )
                except Exception as e:
                    logger.error(f"Failed to update chat in MongoDB: {e}")

            return {
                "chat_id": chat_id,
                "title": existing_title,
                "tag": domain,
                "user_message": user_msg,
                "assistant_message": assistant_msg
            }

    def toggle_pin(self, chat_id: str) -> bool:
        """
        Toggle pinned status of a chat.
        """
        col = self.get_chats_collection()
        new_val = False

        if chat_id in self._fallback_chats:
            self._fallback_chats[chat_id]["is_pinned"] = not self._fallback_chats[chat_id].get("is_pinned", False)
            self._fallback_chats[chat_id]["updated_at"] = datetime.now()
            new_val = self._fallback_chats[chat_id]["is_pinned"]

        if col is not None:
            try:
                doc = col.find_one({"id": chat_id}, {"is_pinned": 1})
                current = bool(doc.get("is_pinned", False)) if doc else False
                new_val = not current
                col.update_one({"id": chat_id}, {"$set": {"is_pinned": new_val, "updated_at": datetime.now()}})
            except Exception as e:
                logger.error(f"Error toggling pin for chat {chat_id}: {e}")

        return new_val

    def delete_chat(self, chat_id: str) -> bool:
        """
        Delete a chat session.
        """
        col = self.get_chats_collection()
        found = False

        if chat_id in self._fallback_chats:
            del self._fallback_chats[chat_id]
            found = True

        if col is not None:
            try:
                res = col.delete_one({"id": chat_id})
                if res.deleted_count > 0:
                    found = True
            except Exception as e:
                logger.error(f"Error deleting chat {chat_id}: {e}")

        return found

    def rename_chat(self, chat_id: str, new_title: str) -> bool:
        """
        Rename a chat session title.
        """
        clean_title = new_title.strip()
        if not clean_title:
            return False

        found = False
        if chat_id in self._fallback_chats:
            self._fallback_chats[chat_id]["title"] = clean_title
            self._fallback_chats[chat_id]["updated_at"] = datetime.now()
            found = True

        col = self.get_chats_collection()
        if col is not None:
            try:
                res = col.update_one(
                    {"id": chat_id},
                    {"$set": {"title": clean_title, "updated_at": datetime.now()}}
                )
                if res.matched_count > 0:
                    found = True
            except Exception as e:
                logger.error(f"Error renaming chat {chat_id}: {e}")

        return found

# Singleton instance
mongo_manager = MongoManager()

