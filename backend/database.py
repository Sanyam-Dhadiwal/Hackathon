import logging
from pymongo import MongoClient
import mongomock
from backend.config import settings

logger = logging.getLogger("travel_planner.db")
logging.basicConfig(level=logging.INFO)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.mode = "uninitialized"
        self._init_db()

    def _init_db(self, custom_uri=None):
        uri = (custom_uri or settings.MONGODB_URI or "").strip()
        if uri:
            try:
                logger.info(f"Attempting connection to MongoDB ({uri[:30]}...)...")
                # ServerSelectionTimeoutMS ensures we fail fast if credentials/network are bad
                real_client = MongoClient(uri, serverSelectionTimeoutMS=4000)
                # Quick ping to verify connectivity
                real_client.admin.command('ping')
                self.client = real_client
                self.db = self.client[settings.DATABASE_NAME]
                self.mode = "mongodb_atlas" if "mongodb+srv" in uri else "mongodb_local"
                logger.info(f"Successfully connected to real MongoDB ({self.mode})")
                return True
            except Exception as e:
                logger.warning(f"Failed to connect to MongoDB URI ({e}). Falling back to in-memory store.")
        
        # Fallback to mongomock for safe local / hackathon demo execution
        self.client = mongomock.MongoClient()
        self.db = self.client[settings.DATABASE_NAME]
        self.mode = "mongomock_in_memory"
        logger.info("Using In-Memory MongoDB engine (mongomock).")
        return False

    def reconnect(self, new_uri: str) -> dict:
        success = self._init_db(new_uri)
        return {
            "success": success,
            "status": self.get_status()
        }

    def get_status(self) -> dict:
        return {
            "mode": self.mode,
            "is_cloud": self.mode == "mongodb_atlas",
            "database_name": settings.DATABASE_NAME,
            "connected": self.db is not None
        }

db_manager = DatabaseManager()

def get_db():
    return db_manager.db

def get_db_status():
    return db_manager.get_status()

def reconnect_db(new_uri: str):
    return db_manager.reconnect(new_uri)
