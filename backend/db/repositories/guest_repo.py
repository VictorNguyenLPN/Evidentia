import logging
from datetime import datetime
from typing import List, Dict, Any
from backend.db.connection import MongoConnectionManager

logger = logging.getLogger(__name__)

class GuestRepository:
    def __init__(self, conn: MongoConnectionManager):
        self.conn = conn

    def get_guest_question_count(self, ip: str) -> int:
        """
        Get number of questions asked by an unauthenticated guest IP.
        """
        if not ip:
            return 0
        col = self.conn.get_guest_limits_collection()
        if col is not None:
            try:
                doc = col.find_one({"ip": ip})
                if doc:
                    return int(doc.get("questions_used", 0))
                return 0
            except Exception as e:
                logger.error(f"Error querying guest limit from MongoDB for IP {ip}: {e}")

        return self.conn._fallback_guest_limits.get(ip, 0)

    def increment_guest_question_count(self, ip: str) -> int:
        """
        Increment and return questions asked count for an unauthenticated guest IP.
        """
        if not ip:
            return 1

        now = datetime.now()
        col = self.conn.get_guest_limits_collection()
        if col is not None:
            try:
                res = col.find_one_and_update(
                    {"ip": ip},
                    {
                        "$inc": {"questions_used": 1},
                        "$set": {"updated_at": now},
                        "$setOnInsert": {"created_at": now},
                    },
                    upsert=True,
                    return_document=True,
                )
                if res:
                    return int(res.get("questions_used", 1))
            except Exception as e:
                logger.error(f"Error incrementing guest limit in MongoDB for IP {ip}: {e}")

        # In-memory fallback
        cur = self.conn._fallback_guest_limits.get(ip, 0) + 1
        self.conn._fallback_guest_limits[ip] = cur
        return cur

    def check_guest_limit_exceeded(self, ip: str, max_limit: int = 2) -> bool:
        """
        Check if unauthenticated guest IP has reached the max question limit.
        """
        count = self.get_guest_question_count(ip)
        return count >= max_limit

    def get_all_guest_limits_admin(self) -> List[Dict[str, Any]]:
        """
        List all IP guest quotas tracked in the system for admin audit.
        """
        col = self.conn.get_guest_limits_collection()
        results: List[Dict[str, Any]] = []

        if col is not None:
            try:
                cursor = col.find().sort("updated_at", -1)
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    if isinstance(doc.get("created_at"), datetime):
                        doc["created_at"] = doc["created_at"].isoformat()
                    if isinstance(doc.get("updated_at"), datetime):
                        doc["updated_at"] = doc["updated_at"].isoformat()
                    results.append(doc)
                return results
            except Exception as e:
                logger.error(f"Error fetching guest limits from MongoDB: {e}")

        for ip_addr, count in self.conn._fallback_guest_limits.items():
            results.append({
                "_id": f"fb_guest_{ip_addr}",
                "ip": ip_addr,
                "questions_used": count,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            })
        return results

    def reset_guest_limit_for_ip(self, ip: str) -> bool:
        """
        Reset guest question limit for a specific IP.
        """
        col = self.conn.get_guest_limits_collection()
        if col is not None:
            try:
                col.update_one(
                    {"ip": ip},
                    {"$set": {"questions_used": 0, "updated_at": datetime.now()}},
                    upsert=True,
                )
            except Exception as e:
                logger.error(f"Error resetting guest limit for {ip} in MongoDB: {e}")
                return False

        self.conn._fallback_guest_limits[ip] = 0
        return True

    def reset_all_guest_limits(self) -> int:
        """
        Reset guest question limit for all tracked IPs.
        """
        col = self.conn.get_guest_limits_collection()
        count = 0
        if col is not None:
            try:
                res = col.update_many(
                    {},
                    {"$set": {"questions_used": 0, "updated_at": datetime.now()}},
                )
                count = res.modified_count
            except Exception as e:
                logger.error(f"Error resetting all guest limits in MongoDB: {e}")

        for ip_addr in list(self.conn._fallback_guest_limits.keys()):
            self.conn._fallback_guest_limits[ip_addr] = 0
            count += 1
        return count

    def delete_guest_limit_for_ip(self, ip: str) -> bool:
        """
        Delete a guest limit record for an IP completely.
        """
        col = self.conn.get_guest_limits_collection()
        if col is not None:
            try:
                col.delete_one({"ip": ip})
            except Exception as e:
                logger.error(f"Error deleting guest limit for {ip} in MongoDB: {e}")
                return False

        self.conn._fallback_guest_limits.pop(ip, None)
        return True
