import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import bcrypt

from backend.db.connection import MongoConnectionManager
from backend.config import get_plan_question_limit

logger = logging.getLogger(__name__)

class UserRepository:
    def __init__(self, conn: MongoConnectionManager):
        self.conn = conn

    def init_default_user_if_needed(self) -> None:
        """
        Ensure default demo admin user exists in DB and in-memory fallback.
        """
        default_email = "huy.nguyen@evidentia.vn"
        default_pwd = "Evidentia@2026"
        hashed = bcrypt.hashpw(default_pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        default_user = {
            "id": "usr_default_admin",
            "email": default_email,
            "password_hash": hashed,
            "full_name": "Quang Huy (Admin Demo)",
            "role": "admin",
            "plan": "pro",
            "avatar": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        self.conn._fallback_users[default_email] = default_user
        self.conn._fallback_users["usr_default_admin"] = default_user

        col = self.conn.get_users_collection()
        if col is not None:
            try:
                col.create_index("email", unique=True)
                col.create_index("id", unique=True)
                col.update_one(
                    {"email": default_email},
                    {
                        "$setOnInsert": {
                            "id": "usr_default_admin",
                            "email": default_email,
                            "password_hash": hashed,
                            "full_name": "Quang Huy (Admin Demo)",
                            "role": "admin",
                            "plan": "pro",
                            "avatar": None,
                            "created_at": datetime.now(),
                            "updated_at": datetime.now(),
                        }
                    },
                    upsert=True,
                )
            except Exception as e:
                logger.warning(f"Note on initializing default user in MongoDB: {e}")

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if not email:
            return None
        clean_email = email.strip().lower()
        col = self.conn.get_users_collection()
        if col is not None:
            try:
                user = col.find_one({"email": clean_email})
                if user:
                    user["_id"] = str(user["_id"])
                    return user
            except Exception as e:
                logger.error(f"Error querying user by email in MongoDB: {e}")

        for u in self.conn._fallback_users.values():
            if u.get("email", "").lower() == clean_email:
                return dict(u)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not user_id:
            return None
        col = self.conn.get_users_collection()
        if col is not None:
            try:
                user = col.find_one({"id": user_id})
                if user:
                    user["_id"] = str(user["_id"])
                    return user
            except Exception as e:
                logger.error(f"Error querying user by id in MongoDB: {e}")

        if user_id in self.conn._fallback_users:
            return dict(self.conn._fallback_users[user_id])
        return None

    def create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        role: str = "user",
        plan: str = "free",
    ) -> Dict[str, Any]:
        clean_email = email.strip().lower()
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        now = datetime.now()

        user_doc = {
            "id": user_id,
            "email": clean_email,
            "password_hash": password_hash,
            "full_name": full_name.strip(),
            "role": role,
            "plan": plan,
            "avatar": None,
            "created_at": now,
            "updated_at": now,
        }

        col = self.conn.get_users_collection()
        if col is not None:
            try:
                col.insert_one(dict(user_doc))
            except Exception as e:
                logger.error(f"Error creating user in MongoDB: {e}")
                raise e

        self.conn._fallback_users[clean_email] = user_doc
        self.conn._fallback_users[user_id] = user_doc
        return user_doc

    def update_user_profile(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        avatar: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        updates: Dict[str, Any] = {"updated_at": datetime.now()}
        if full_name is not None:
            updates["full_name"] = full_name.strip()
        if avatar is not None:
            updates["avatar"] = avatar.strip()

        col = self.conn.get_users_collection()
        if col is not None:
            try:
                res = col.find_one_and_update(
                    {"id": user_id},
                    {"$set": updates},
                    return_document=True,
                )
                if res:
                    res["_id"] = str(res["_id"])
                    return res
            except Exception as e:
                logger.error(f"Error updating user profile in MongoDB: {e}")

        if user_id in self.conn._fallback_users:
            self.conn._fallback_users[user_id].update(updates)
            return dict(self.conn._fallback_users[user_id])
        return None

    def update_user_password(self, user_id: str, new_password_hash: str) -> bool:
        updates = {
            "password_hash": new_password_hash,
            "updated_at": datetime.now(),
        }
        col = self.conn.get_users_collection()
        if col is not None:
            try:
                res = col.update_one({"id": user_id}, {"$set": updates})
                return res.modified_count > 0 or res.matched_count > 0
            except Exception as e:
                logger.error(f"Error updating password in MongoDB: {e}")
                return False

        if user_id in self.conn._fallback_users:
            self.conn._fallback_users[user_id].update(updates)
            return True
        return False

    def get_all_users_admin(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        plan: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        col = self.conn.get_users_collection()
        filter_doc: Dict[str, Any] = {}

        if role and role.strip() and role != "all":
            filter_doc["role"] = role.strip()
        if plan and plan.strip() and plan != "all":
            filter_doc["plan"] = plan.strip()
        if query and query.strip():
            regex_q = {"$regex": query.strip(), "$options": "i"}
            filter_doc["$or"] = [
                {"email": regex_q},
                {"full_name": regex_q},
                {"id": regex_q},
            ]

        users: List[Dict[str, Any]] = []
        total = 0

        if col is not None:
            try:
                total = col.count_documents(filter_doc)
                cursor = col.find(filter_doc).sort("created_at", -1).skip(skip).limit(limit)
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    doc.pop("password_hash", None)
                    if isinstance(doc.get("created_at"), datetime):
                        doc["created_at"] = doc["created_at"].isoformat()
                    if isinstance(doc.get("updated_at"), datetime):
                        doc["updated_at"] = doc["updated_at"].isoformat()
                    users.append(doc)
                return {"users": users, "total": total}
            except Exception as e:
                logger.error(f"Error fetching users for admin from MongoDB: {e}")

        # Fallback in-memory
        all_unique = {u["id"]: u for u in self.conn._fallback_users.values()}
        filtered = list(all_unique.values())

        if role and role != "all":
            filtered = [u for u in filtered if u.get("role") == role]
        if plan and plan != "all":
            filtered = [u for u in filtered if u.get("plan") == plan]
        if query and query.strip():
            q_lower = query.strip().lower()
            filtered = [
                u for u in filtered
                if q_lower in u.get("email", "").lower()
                or q_lower in u.get("full_name", "").lower()
                or q_lower in u.get("id", "").lower()
            ]

        total = len(filtered)
        paginated = filtered[skip : skip + limit]

        safe_users = []
        for u in paginated:
            safe = dict(u)
            safe.pop("password_hash", None)
            if isinstance(safe.get("created_at"), datetime):
                safe["created_at"] = safe["created_at"].isoformat()
            if isinstance(safe.get("updated_at"), datetime):
                safe["updated_at"] = safe["updated_at"].isoformat()
            safe_users.append(safe)

        return {"users": safe_users, "total": total}

    def admin_create_user(
        self,
        email: str,
        password_hash: str,
        full_name: str,
        role: str = "user",
        plan: str = "free",
    ) -> Dict[str, Any]:
        return self.create_user(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            plan=plan,
        )

    def admin_update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        clean_updates = {k: v for k, v in updates.items() if v is not None}
        clean_updates["updated_at"] = datetime.now()

        col = self.conn.get_users_collection()
        if col is not None:
            try:
                res = col.find_one_and_update(
                    {"id": user_id},
                    {"$set": clean_updates},
                    return_document=True,
                )
                if res:
                    res["_id"] = str(res["_id"])
                    res.pop("password_hash", None)
                    return res
            except Exception as e:
                logger.error(f"Error updating user by admin in MongoDB: {e}")

        if user_id in self.conn._fallback_users:
            self.conn._fallback_users[user_id].update(clean_updates)
            safe = dict(self.conn._fallback_users[user_id])
            safe.pop("password_hash", None)
            return safe
        return None

    def admin_delete_user(self, user_id: str, delete_chats: bool = True) -> bool:
        col_users = self.conn.get_users_collection()
        col_chats = self.conn.get_chats_collection()

        if col_users is not None:
            try:
                col_users.delete_one({"id": user_id})
                if delete_chats and col_chats is not None:
                    col_chats.delete_many({"user_id": user_id})
            except Exception as e:
                logger.error(f"Error deleting user {user_id} in MongoDB: {e}")
                return False

        # In-memory fallback cleanup
        self.conn._fallback_users.pop(user_id, None)
        to_del_email = [k for k, v in self.conn._fallback_users.items() if v.get("id") == user_id]
        for k in to_del_email:
            self.conn._fallback_users.pop(k, None)

        if delete_chats:
            to_del_chats = [cid for cid, c in self.conn._fallback_chats.items() if c.get("user_id") == user_id]
            for cid in to_del_chats:
                self.conn._fallback_chats.pop(cid, None)

        return True

    def get_user_question_count(self, user_id: str) -> int:
        if not user_id:
            return 0
        user = self.get_user_by_id(user_id)
        if not user:
            return 0
        return int(user.get("questions_used", 0))

    def increment_user_question_count(self, user_id: str) -> int:
        if not user_id:
            return 0
        col = self.conn.get_users_collection()
        if col is not None:
            try:
                res = col.find_one_and_update(
                    {"id": user_id},
                    {
                        "$inc": {"questions_used": 1},
                        "$set": {"updated_at": datetime.now()},
                    },
                    return_document=True,
                )
                if res:
                    return int(res.get("questions_used", 1))
            except Exception as e:
                logger.error(f"Error incrementing user question count in MongoDB: {e}")

        if user_id in self.conn._fallback_users:
            curr = self.conn._fallback_users[user_id].get("questions_used", 0) + 1
            self.conn._fallback_users[user_id]["questions_used"] = curr
            self.conn._fallback_users[user_id]["updated_at"] = datetime.now()
            return curr
        return 1

    def reset_user_question_count(self, user_id: str) -> bool:
        if not user_id:
            return False
        col = self.conn.get_users_collection()
        if col is not None:
            try:
                res = col.update_one(
                    {"$or": [{"id": user_id}, {"email": user_id}]},
                    {"$set": {"questions_used": 0, "updated_at": datetime.now()}},
                )
                return res.modified_count > 0 or res.matched_count > 0
            except Exception as e:
                logger.error(f"Error resetting user question count in MongoDB: {e}")
                return False

        if user_id in self.conn._fallback_users:
            self.conn._fallback_users[user_id]["questions_used"] = 0
            self.conn._fallback_users[user_id]["updated_at"] = datetime.now()
            return True
        for uid, u in self.conn._fallback_users.items():
            if u.get("email") == user_id:
                u["questions_used"] = 0
                u["updated_at"] = datetime.now()
                return True
        return False

    def reset_user_question_count_by_identifier(self, identifier: str) -> bool:
        return self.reset_user_question_count(identifier)

    def reset_all_users_question_count(self, plan: Optional[str] = None) -> int:
        """
        Reset questions_used to 0 for all users, or users matching a specific plan.
        """
        filter_doc: Dict[str, Any] = {}
        if plan and plan.lower() != "all":
            filter_doc["plan"] = plan.lower()

        col = self.conn.get_users_collection()
        count = 0
        if col is not None:
            try:
                res = col.update_many(
                    filter_doc,
                    {"$set": {"questions_used": 0, "updated_at": datetime.now()}},
                )
                count = res.modified_count
            except Exception as e:
                logger.error(f"Error resetting all users question count in MongoDB: {e}")

        # In-memory fallback
        for uid, u in self.conn._fallback_users.items():
            if plan and plan.lower() != "all" and u.get("plan", "free").lower() != plan.lower():
                continue
            u["questions_used"] = 0
            u["updated_at"] = datetime.now()
            count += 1

        return count

    def get_user_quotas_admin(
        self,
        query: Optional[str] = None,
        plan: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> Dict[str, Any]:
        """
        Return user quota and usage metrics for all users, with computed limits and remaining counts.
        """
        col = self.conn.get_users_collection()
        user_list: List[Dict[str, Any]] = []

        if col is not None:
            try:
                mongo_filter: Dict[str, Any] = {}
                if plan and plan.lower() != "all":
                    mongo_filter["plan"] = plan.lower()
                if query and query.strip():
                    q = query.strip()
                    mongo_filter["$or"] = [
                        {"email": {"$regex": q, "$options": "i"}},
                        {"full_name": {"$regex": q, "$options": "i"}},
                        {"id": {"$regex": q, "$options": "i"}},
                    ]

                total = col.count_documents(mongo_filter)
                cursor = (
                    col.find(mongo_filter)
                    .sort([("updated_at", -1), ("created_at", -1)])
                    .skip(skip)
                    .limit(limit)
                )

                for doc in cursor:
                    doc_id = doc.get("id") or str(doc.get("_id"))
                    p = doc.get("plan", "free")
                    r = doc.get("role", "user")
                    q_used = int(doc.get("questions_used", 0))
                    p_limit = get_plan_question_limit(p, r)

                    user_list.append({
                        "id": doc_id,
                        "email": doc.get("email", ""),
                        "full_name": doc.get("full_name", ""),
                        "role": r,
                        "plan": p,
                        "questions_used": q_used,
                        "questions_limit": p_limit,
                        "questions_remaining": -1 if p_limit == -1 else max(0, p_limit - q_used),
                        "limit_reached": (q_used >= p_limit) if p_limit != -1 else False,
                        "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
                        "updated_at": doc.get("updated_at").isoformat() if isinstance(doc.get("updated_at"), datetime) else doc.get("updated_at"),
                    })

                return {"user_quotas": user_list, "total": total}
            except Exception as e:
                logger.error(f"Error fetching user quotas in MongoDB: {e}")

        # In-memory fallback
        all_users = list(self.conn._fallback_users.values())
        filtered = []
        for u in all_users:
            if plan and plan.lower() != "all" and u.get("plan", "free").lower() != plan.lower():
                continue
            if query and query.strip():
                q_lower = query.strip().lower()
                if (
                    q_lower not in u.get("email", "").lower()
                    and q_lower not in u.get("full_name", "").lower()
                    and q_lower not in u.get("id", "").lower()
                ):
                    continue
            filtered.append(u)

        total = len(filtered)
        paginated = filtered[skip : skip + limit]
        for u in paginated:
            p = u.get("plan", "free")
            r = u.get("role", "user")
            q_used = int(u.get("questions_used", 0))
            p_limit = get_plan_question_limit(p, r)
            user_list.append({
                "id": u.get("id", ""),
                "email": u.get("email", ""),
                "full_name": u.get("full_name", ""),
                "role": r,
                "plan": p,
                "questions_used": q_used,
                "questions_limit": p_limit,
                "questions_remaining": -1 if p_limit == -1 else max(0, p_limit - q_used),
                "limit_reached": (q_used >= p_limit) if p_limit != -1 else False,
                "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
                "updated_at": u.get("updated_at").isoformat() if isinstance(u.get("updated_at"), datetime) else u.get("updated_at"),
            })

        return {"user_quotas": user_list, "total": total}


