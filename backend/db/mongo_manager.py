import base64
import hashlib
import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

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
        self._fallback_laws: Dict[str, Dict[str, Any]] = {}
        self._fallback_articles: Dict[str, List[Dict[str, Any]]] = {}

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

    def get_laws_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["laws"]
        return None

    def get_articles_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["law_articles"]
        return None

    @staticmethod
    def _format_relative_time(updated: Any) -> str:
        if isinstance(updated, str):
            try:
                updated = datetime.fromisoformat(updated)
            except Exception:
                return datetime.now().strftime("%H:%M - %d/%m/%Y")

        if isinstance(updated, datetime):
            return updated.strftime("%H:%M - %d/%m/%Y")
        return datetime.now().strftime("%H:%M - %d/%m/%Y")

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
                    created = doc.get("created_at")
                    updated = doc.get("updated_at")
                    chats.append({
                        "id": doc.get("id"),
                        "title": doc.get("title", "Đoạn chat mới"),
                        "tag": doc.get("tag", "Pháp luật"),
                        "isPinned": bool(doc.get("is_pinned", False)),
                        "time": self._format_relative_time(updated or created),
                        "created_at": created.isoformat() if isinstance(created, datetime) else created,
                        "updated_at": updated.isoformat() if isinstance(updated, datetime) else updated,
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
                "time": self._format_relative_time(doc.get("updated_at") or doc.get("created_at")),
                "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
                "updated_at": doc.get("updated_at").isoformat() if isinstance(doc.get("updated_at"), datetime) else doc.get("updated_at"),
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
        steps: Optional[List[Dict[str, Any]]] = None,
        token_usage: Optional[Dict[str, Any]] = None
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
            "steps": steps or [],
            "token_usage": token_usage or {}
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

    def clear_all_chats(self) -> int:
        """
        Delete all chat sessions from MongoDB and fallback memory.
        Returns the number of deleted chats.
        """
        deleted_count = len(self._fallback_chats)
        self._fallback_chats.clear()

        col = self.get_chats_collection()
        if col is not None:
            try:
                res = col.delete_many({})
                deleted_count = max(deleted_count, res.deleted_count)
            except Exception as e:
                logger.error(f"Error clearing all chats from MongoDB: {e}")

        return deleted_count


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

    def _structure_law_data(self, chunks: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Transform raw chunk list into structured Law Documents and Articles.
        """
        docs_map: Dict[str, Dict[str, Any]] = {}
        articles_map: Dict[Tuple[str, int], Dict[str, Any]] = {}

        for item in chunks:
            meta = item.get("metadata", {})
            doc_id = meta.get("document_id")
            if not doc_id:
                continue

            if doc_id not in docs_map:
                docs_map[doc_id] = {
                    "document_id": doc_id,
                    "document_title": meta.get("document_title", "Văn bản luật"),
                    "doc_identity": meta.get("doc_identity", ""),
                    "document_type": meta.get("document_type", "Bộ luật"),
                    "issue_date": meta.get("issue_date"),
                    "effect_date": meta.get("effect_date"),
                    "effect_status_name": meta.get("effect_status_name", "Đang có hiệu lực"),
                    "expire_date": meta.get("expire_date"),
                    "organ_names": meta.get("organ_names") or [],
                    "signer_title_names": meta.get("signer_title_names") or [],
                    "signer_names": meta.get("signer_names") or [],
                    "vbpl_url": meta.get("vbpl_url", ""),
                    "field_names": meta.get("field_names") or [],
                    "chapters_dict": {},
                    "stats": {
                        "total_articles": 0,
                        "total_chapters": 0,
                        "total_clauses": 0,
                        "total_points": 0,
                        "total_chunks": 0
                    }
                }

            docs_map[doc_id]["stats"]["total_chunks"] += 1
            nt = item.get("node_type")
            if nt == "clause":
                docs_map[doc_id]["stats"]["total_clauses"] += 1
            elif nt == "point":
                docs_map[doc_id]["stats"]["total_points"] += 1

            ch_num = str(meta.get("chapter_number") or "Khác")
            ch_title = meta.get("chapter_title") or "Chương không có tiêu đề"
            art_num = meta.get("article_number")
            art_title = meta.get("article_title") or (f"Điều {art_num}" if art_num is not None else "Điều")

            if ch_num not in docs_map[doc_id]["chapters_dict"]:
                docs_map[doc_id]["chapters_dict"][ch_num] = {
                    "chapter_number": ch_num,
                    "chapter_title": ch_title,
                    "articles": []
                }

            if art_num is not None:
                art_key = (doc_id, int(art_num))
                if art_key not in articles_map:
                    articles_map[art_key] = {
                        "document_id": doc_id,
                        "document_title": meta.get("document_title", ""),
                        "chapter_number": ch_num,
                        "chapter_title": ch_title,
                        "article_number": int(art_num),
                        "article_title": art_title,
                        "lead_in_text": meta.get("lead_in_text"),
                        "hierarchy_path": meta.get("hierarchy_path", []),
                        "article_text": item.get("text") if nt == "article" else None,
                        "clauses_dict": {},
                        "amendment_notes": list(item.get("amendment_notes") or [])
                    }
                    docs_map[doc_id]["chapters_dict"][ch_num]["articles"].append({
                        "article_number": int(art_num),
                        "article_title": art_title
                    })
                    docs_map[doc_id]["stats"]["total_articles"] += 1

                cl_num = meta.get("clause_number")
                pt = meta.get("point")

                if nt == "article":
                    articles_map[art_key]["article_text"] = item.get("text")
                    if item.get("amendment_notes"):
                        articles_map[art_key]["amendment_notes"].extend(item.get("amendment_notes"))
                elif nt == "clause" and cl_num is not None:
                    cl_k = int(cl_num) if isinstance(cl_num, int) or (isinstance(cl_num, str) and cl_num.isdigit()) else cl_num
                    if cl_k not in articles_map[art_key]["clauses_dict"]:
                        articles_map[art_key]["clauses_dict"][cl_k] = {
                            "clause_number": cl_k,
                            "clause_title": meta.get("clause_title"),
                            "lead_in_text": meta.get("lead_in_text"),
                            "text": item.get("text") or "",
                            "points": [],
                            "amendment_notes": list(item.get("amendment_notes") or [])
                        }
                    else:
                        if item.get("text"):
                            articles_map[art_key]["clauses_dict"][cl_k]["text"] = item.get("text")
                        if item.get("amendment_notes"):
                            articles_map[art_key]["clauses_dict"][cl_k]["amendment_notes"].extend(item.get("amendment_notes"))
                elif nt == "point":
                    if cl_num is not None:
                        cl_k = int(cl_num) if isinstance(cl_num, int) or (isinstance(cl_num, str) and cl_num.isdigit()) else cl_num
                        if cl_k not in articles_map[art_key]["clauses_dict"]:
                            articles_map[art_key]["clauses_dict"][cl_k] = {
                                "clause_number": cl_k,
                                "clause_title": meta.get("clause_title"),
                                "lead_in_text": meta.get("lead_in_text"),
                                "text": "",
                                "points": [],
                                "amendment_notes": []
                            }
                        articles_map[art_key]["clauses_dict"][cl_k]["points"].append({
                            "point": pt,
                            "text": item.get("text"),
                            "amendment_notes": list(item.get("amendment_notes") or [])
                        })

        # Finalize Law Documents
        final_docs = []
        for doc_id, d in docs_map.items():
            d["stats"]["total_chapters"] = len(d["chapters_dict"])
            chapters_list = []
            for ch_num, ch_data in d["chapters_dict"].items():
                arts = ch_data["articles"]
                range_str = ""
                if arts:
                    range_str = f"Điều {arts[0]['article_number']} - Điều {arts[-1]['article_number']}"
                chapters_list.append({
                    "chapter_number": ch_num,
                    "chapter_title": ch_data["chapter_title"],
                    "article_count": len(arts),
                    "article_range": range_str,
                    "articles": arts
                })
            d["chapters"] = chapters_list
            del d["chapters_dict"]
            final_docs.append(d)

        # Finalize Articles
        final_articles = []
        for art in articles_map.values():
            clauses = []
            for cl_k in sorted(art["clauses_dict"].keys(), key=lambda x: (isinstance(x, str), x)):
                cl_data = art["clauses_dict"][cl_k]
                clauses.append(cl_data)

            # Build readable rendered text representation
            lines = [f"Điều {art['article_number']}. {art['article_title']}"]
            if art.get("article_text"):
                lines.append(art["article_text"])
            for cl in clauses:
                cl_num_str = f"{cl['clause_number']}. " if cl.get("clause_number") is not None else ""
                cl_body = cl.get("text") or cl.get("lead_in_text") or ""
                if cl_body:
                    lines.append(f"{cl_num_str}{cl_body}")
                for p in cl.get("points", []):
                    lines.append(f"   {p.get('point')}) {p.get('text')}")

            art_final = {
                "document_id": art["document_id"],
                "document_title": art["document_title"],
                "chapter_number": art["chapter_number"],
                "chapter_title": art["chapter_title"],
                "article_number": art["article_number"],
                "article_title": art["article_title"],
                "hierarchy_path": art["hierarchy_path"],
                "article_text": art["article_text"],
                "clauses": clauses,
                "amendment_notes": list(set(art["amendment_notes"])),
                "full_rendered_text": "\n".join(lines)
            }
            final_articles.append(art_final)

        # Sort articles by document_id and article_number
        final_articles.sort(key=lambda a: (a["document_id"], a["article_number"]))
        return final_docs, final_articles

    def sync_laws_on_startup(self, data_path: Any) -> Dict[str, Any]:
        """
        Synchronize law metadata, statistics, and structured articles into MongoDB on startup.
        If MongoDB is unconfigured or offline, retains in-memory fallback.
        """
        import json
        from pathlib import Path
        
        path_obj = Path(data_path) if isinstance(data_path, (str, Path)) else None
        if not path_obj or not path_obj.exists():
            logger.warning(f"Data file not found at {data_path}. Law sync skipped.")
            return {"status": "file_not_found", "message": f"Data file not found at {data_path}"}

        try:
            with open(path_obj, "r", encoding="utf-8") as f:
                chunks = json.load(f)

            if not isinstance(chunks, list):
                return {"status": "invalid_data", "message": "Expected JSON list of chunks"}

            docs, articles = self._structure_law_data(chunks)

            # Store in fallback
            for d in docs:
                self._fallback_laws[d["document_id"]] = d
            for a in articles:
                doc_id = a["document_id"]
                if doc_id not in self._fallback_articles:
                    self._fallback_articles[doc_id] = []
                self._fallback_articles[doc_id].append(a)

            laws_col = self.get_laws_collection()
            articles_col = self.get_articles_collection()

            if laws_col is not None and articles_col is not None:
                # Check existing records & count verification
                existing_laws_count = laws_col.count_documents({})
                existing_articles_count = articles_col.count_documents({})
                local_laws_count = len(docs)
                local_articles_count = len(articles)

                # Create indexes if needed
                try:
                    laws_col.create_index("document_id", unique=True)
                    articles_col.create_index([("document_id", pymongo.ASCENDING), ("article_number", pymongo.ASCENDING)], unique=True)
                    articles_col.create_index([("document_id", pymongo.ASCENDING), ("chapter_number", pymongo.ASCENDING)])
                except Exception as idx_err:
                    logger.warning(f"Index creation note: {idx_err}")

                # 1. If MongoDB is empty: log warning and skip auto-update
                if existing_laws_count == 0 or existing_articles_count == 0:
                    msg = (
                        f"MongoDB collection 'laws' is empty (MongoDB: {existing_laws_count} laws, {existing_articles_count} articles "
                        f"vs Local: {local_laws_count} laws, {local_articles_count} articles). Auto-sync skipped."
                    )
                    logger.warning(msg)
                    return {
                        "status": "empty_warning",
                        "local_laws_count": local_laws_count,
                        "local_articles_count": local_articles_count,
                        "mongodb_laws_count": existing_laws_count,
                        "mongodb_articles_count": existing_articles_count,
                        "message": msg
                    }

                # 2. If count mismatch: log warning and skip auto-update
                if existing_articles_count != local_articles_count or existing_laws_count != local_laws_count:
                    msg = (
                        f"Count mismatch detected in MongoDB: MongoDB ({existing_laws_count} laws, {existing_articles_count} articles) "
                        f"vs Local ({local_laws_count} laws, {local_articles_count} articles). Auto-sync skipped."
                    )
                    logger.warning(msg)
                    return {
                        "status": "count_mismatch",
                        "local_laws_count": local_laws_count,
                        "local_articles_count": local_articles_count,
                        "mongodb_laws_count": existing_laws_count,
                        "mongodb_articles_count": existing_articles_count,
                        "message": msg
                    }

                # 3. Exactly in sync
                logger.info(
                    f"MongoDB is in sync with local dataset ({existing_laws_count} law(s), {existing_articles_count} articles)."
                )
                return {
                    "status": "in_sync",
                    "laws_count": existing_laws_count,
                    "articles_count": existing_articles_count,
                    "message": f"MongoDB laws collection is in sync ({existing_laws_count} law(s), {existing_articles_count} articles)."
                }

            logger.info(f"Operated laws in in-memory fallback ({len(docs)} law(s), {len(articles)} articles).")
            return {
                "status": "fallback_ready",
                "laws_count": len(docs),
                "articles_count": len(articles),
                "message": "Operated in in-memory fallback mode."
            }

        except Exception as e:
            logger.error(f"Error during laws startup sync: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}

    def ingest_laws(self, data_path: Any) -> Dict[str, Any]:
        """
        Explicitly ingest/update law documents and structured articles to MongoDB.
        Only executed on manual command/request, NOT automatically on startup.
        """
        import json
        from pathlib import Path

        path_obj = Path(data_path) if isinstance(data_path, (str, Path)) else None
        if not path_obj or not path_obj.exists():
            return {"status": "file_not_found", "message": f"Data file not found at {data_path}"}

        try:
            with open(path_obj, "r", encoding="utf-8") as f:
                chunks = json.load(f)

            docs, articles = self._structure_law_data(chunks)
            laws_col = self.get_laws_collection()
            articles_col = self.get_articles_collection()

            if laws_col is None or articles_col is None:
                return {"status": "error", "message": "MongoDB is not connected."}

            logger.info(f"Explicitly uploading {len(docs)} law(s) and {len(articles)} articles to MongoDB...")
            for d in docs:
                laws_col.replace_one({"document_id": d["document_id"]}, d, upsert=True)
            for a in articles:
                articles_col.replace_one(
                    {"document_id": a["document_id"], "article_number": a["article_number"]},
                    a,
                    upsert=True
                )

            final_laws = laws_col.count_documents({})
            final_arts = articles_col.count_documents({})
            logger.info(f"Ingestion complete! Total in MongoDB: {final_laws} laws, {final_arts} articles.")
            return {
                "status": "success",
                "laws_count": final_laws,
                "articles_count": final_arts,
                "message": f"Successfully ingested {final_laws} laws and {final_arts} articles to MongoDB."
            }
        except Exception as e:
            logger.error(f"Error during explicit law ingestion: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}

    def get_all_laws(self) -> Dict[str, Any]:
        """
        Retrieve all law documents with overall statistics.
        """
        laws_col = self.get_laws_collection()
        laws_list = []

        if laws_col is not None:
            try:
                cursor = laws_col.find({}, {"_id": 0})
                laws_list = list(cursor)
            except Exception as e:
                logger.error(f"Error fetching laws from MongoDB: {e}")

        if not laws_list:
            laws_list = list(self._fallback_laws.values())

        total_articles = sum(l.get("stats", {}).get("total_articles", 0) for l in laws_list)
        total_chapters = sum(l.get("stats", {}).get("total_chapters", 0) for l in laws_list)
        total_chunks = sum(l.get("stats", {}).get("total_chunks", 0) for l in laws_list)

        return {
            "total_laws": len(laws_list),
            "total_articles": total_articles,
            "total_chapters": total_chapters,
            "total_chunks": total_chunks,
            "laws": laws_list
        }

    def get_law_detail(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve single law document metadata and chapter table of contents.
        """
        laws_col = self.get_laws_collection()
        if laws_col is not None:
            try:
                doc = laws_col.find_one(
                    {"$or": [{"document_id": document_id}, {"doc_identity": document_id}]},
                    {"_id": 0}
                )
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"Error fetching law {document_id} from MongoDB: {e}")

        if document_id in self._fallback_laws:
            return self._fallback_laws[document_id]
        for d in self._fallback_laws.values():
            if d.get("doc_identity") == document_id:
                return d
        return None

    def get_law_articles(
        self,
        document_id: str,
        chapter_number: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Retrieve paginated articles for a law document, with support for chapter filtering and keyword search.
        Used for infinite scroll / lazy loading.
        """
        page = max(1, page)
        limit = max(1, min(100, limit))
        skip = (page - 1) * limit

        articles_col = self.get_articles_collection()
        if articles_col is not None:
            try:
                doc_query = {"$or": [{"document_id": document_id}, {"doc_identity": document_id}]}
                query: Dict[str, Any] = {**doc_query}
                if chapter_number:
                    query["chapter_number"] = str(chapter_number)

                if search and search.strip():
                    term = search.strip()
                    # Check if search is a specific article number
                    if term.isdigit():
                        query["$or"] = [
                            {"article_number": int(term)},
                            {"article_title": {"$regex": term, "$options": "i"}},
                            {"full_rendered_text": {"$regex": term, "$options": "i"}}
                        ]
                    else:
                        query["$or"] = [
                            {"article_title": {"$regex": term, "$options": "i"}},
                            {"full_rendered_text": {"$regex": term, "$options": "i"}}
                        ]

                total = articles_col.count_documents(query)
                cursor = (
                    articles_col.find(query, {"_id": 0})
                    .sort("article_number", pymongo.ASCENDING)
                    .skip(skip)
                    .limit(limit)
                )
                articles = list(cursor)
                return {
                    "document_id": document_id,
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "has_more": (skip + len(articles)) < total,
                    "articles": articles
                }
            except Exception as e:
                logger.error(f"Error querying articles from MongoDB: {e}")

        # Fallback in-memory search & pagination
        all_arts = self._fallback_articles.get(document_id, [])
        if not all_arts:
            for d_id, arts in self._fallback_articles.items():
                if any(a.get("doc_identity") == document_id for a in arts):
                    all_arts = arts
                    break
        filtered = all_arts
        if chapter_number:
            filtered = [a for a in filtered if str(a.get("chapter_number")) == str(chapter_number)]

        if search and search.strip():
            s_lower = search.strip().lower()
            if s_lower.isdigit():
                art_val = int(s_lower)
                filtered = [
                    a for a in filtered
                    if a.get("article_number") == art_val
                    or s_lower in (a.get("article_title") or "").lower()
                    or s_lower in (a.get("full_rendered_text") or "").lower()
                ]
            else:
                filtered = [
                    a for a in filtered
                    if s_lower in (a.get("article_title") or "").lower()
                    or s_lower in (a.get("full_rendered_text") or "").lower()
                ]

        total = len(filtered)
        paged = filtered[skip : skip + limit]
        return {
            "document_id": document_id,
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": (skip + len(paged)) < total,
            "articles": paged
        }

    def get_law_article(self, document_id: str, article_number: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single specific article by document_id/doc_identity and article_number.
        """
        articles_col = self.get_articles_collection()
        if articles_col is not None:
            try:
                doc = articles_col.find_one(
                    {
                        "$or": [{"document_id": document_id}, {"doc_identity": document_id}],
                        "article_number": int(article_number)
                    },
                    {"_id": 0}
                )
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"Error fetching article {article_number} for {document_id}: {e}")

        for k, art_list in self._fallback_articles.items():
            for a in art_list:
                if (a.get("document_id") == document_id or a.get("doc_identity") == document_id) and a.get("article_number") == int(article_number):
                    return a
        return None

# Singleton instance
mongo_manager = MongoManager()


