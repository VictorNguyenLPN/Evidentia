import logging
from typing import Dict, Any

from backend.db.connection import MongoConnectionManager

logger = logging.getLogger(__name__)

class AdminRepository:
    def __init__(self, conn: MongoConnectionManager):
        self.conn = conn

    def get_admin_overview_stats(self) -> Dict[str, Any]:
        """
        Aggregate high-level system analytics for the Admin dashboard.
        """
        col_users = self.conn.get_users_collection()
        col_chats = self.conn.get_chats_collection()
        col_laws = self.conn.get_laws_collection()
        col_articles = self.conn.get_articles_collection()

        total_users = 0
        admin_users = 0
        pro_users = 0

        total_chats = 0
        total_messages = 0

        total_laws = 0
        total_articles = 0
        total_questions_asked = 0
        free_users = 0

        if col_users is not None:
            try:
                total_users = col_users.count_documents({})
                admin_users = col_users.count_documents({"role": "admin"})
                pro_users = col_users.count_documents({"plan": "pro"})
                free_users = col_users.count_documents({"plan": "free", "role": {"$ne": "admin"}})
                pipeline_q = [
                    {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$questions_used", 0]}}}}
                ]
                agg_q = list(col_users.aggregate(pipeline_q))
                if agg_q:
                    total_questions_asked = agg_q[0].get("total", 0)
            except Exception as e:
                logger.error(f"Error aggregating user stats: {e}")
        else:
            unique_users = {u["id"]: u for u in self.conn._fallback_users.values()}
            total_users = len(unique_users)
            admin_users = sum(1 for u in unique_users.values() if u.get("role") == "admin")
            pro_users = sum(1 for u in unique_users.values() if u.get("plan") == "pro")
            free_users = sum(1 for u in unique_users.values() if u.get("plan") == "free" and u.get("role") != "admin")
            total_questions_asked = sum(int(u.get("questions_used", 0)) for u in unique_users.values())

        if col_chats is not None:
            try:
                total_chats = col_chats.count_documents({})
                pipeline = [
                    {"$project": {"msg_count": {"$size": {"$ifNull": ["$messages", []]}}}},
                    {"$group": {"_id": None, "total": {"$sum": "$msg_count"}}},
                ]
                agg = list(col_chats.aggregate(pipeline))
                if agg:
                    total_messages = agg[0].get("total", 0)
            except Exception as e:
                logger.error(f"Error aggregating chat stats: {e}")
        else:
            total_chats = len(self.conn._fallback_chats)
            total_messages = sum(len(c.get("messages", [])) for c in self.conn._fallback_chats.values())

        if col_laws is not None:
            try:
                total_laws = col_laws.count_documents({})
            except Exception as e:
                logger.error(f"Error aggregating law stats: {e}")
        else:
            total_laws = len(self.conn._fallback_laws)

        if col_articles is not None:
            try:
                total_articles = col_articles.count_documents({})
            except Exception as e:
                logger.error(f"Error aggregating article stats: {e}")
        else:
            total_articles = sum(len(arts) for arts in self.conn._fallback_articles.values())

        return {
            "total_users": total_users,
            "admin_users": admin_users,
            "pro_users": pro_users,
            "free_users": free_users,
            "total_chats": total_chats,
            "total_messages": total_messages,
            "total_questions_asked": total_questions_asked,
            "total_laws": total_laws,
            "total_articles": total_articles,
            "mongodb_connected": self.conn.is_connected(),
        }
