import logging
from typing import Optional, Dict, Any, List
import certifi
from pymongo import MongoClient
from pymongo.collection import Collection

from backend.config import MONGODB_URL, MONGODB_DB_NAME

logger = logging.getLogger(__name__)

class MongoConnectionManager:
    """
    Manages MongoDB MongoClient lifecycle and in-memory fallback stores.
    """
    def __init__(self, uri: str = MONGODB_URL, db_name: str = MONGODB_DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self._client: Optional[MongoClient] = None
        self._connected: Optional[bool] = None

        # In-memory fallback structures for offline development
        self._fallback_chats: Dict[str, Dict[str, Any]] = {}
        self._fallback_laws: Dict[str, Dict[str, Any]] = {}
        self._fallback_articles: Dict[str, List[Dict[str, Any]]] = {}
        self._fallback_users: Dict[str, Dict[str, Any]] = {}
        self._fallback_guest_limits: Dict[str, int] = {}

    def get_client(self) -> Optional[MongoClient]:
        if self._client is None and self.uri and self._connected is not False:
            try:
                self._client = MongoClient(
                    self.uri,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=3000,
                    connectTimeoutMS=3000,
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
            logger.warning(
                "MONGODB_URL is not configured in .env. Chat history and users will operate in fallback mode."
            )
            return {"connected": False, "error": "unconfigured"}

        logger.info(f"Connecting to MongoDB at {self.uri}...")
        try:
            self._client = MongoClient(
                self.uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
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
                logger.warning(f"MongoDB connection failed (TLS/SSL): {e}")
            else:
                logger.warning(
                    f"MongoDB connection failed: {e}. Chat history and users will operate in fallback mode."
                )
            return {"connected": False, "error": err_msg}

    def is_connected(self) -> bool:
        if self._connected is None:
            self.get_client()
        return bool(self._connected)

    def get_chats_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["chats"]
        return None

    def get_users_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["users"]
        return None

    def get_laws_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["laws"]
        return None

    def get_articles_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["articles"]
        return None

    def get_guest_limits_collection(self) -> Optional[Collection]:
        client = self.get_client()
        if client is not None:
            return client[self.db_name]["guest_limits"]
        return None
