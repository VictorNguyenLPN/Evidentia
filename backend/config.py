import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

# Workspace paths
DATA_DIR = PROJECT_ROOT / "data"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
DOCS_DIR = PROJECT_ROOT / "docs"
NOTEBOOK_DIR = PROJECT_ROOT / "notebook"

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite").strip()

# Qdrant Cloud Configuration
QDRANT_URL = os.getenv("QDRANT_URL", "").strip()
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "").strip()
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "evidentia_legal_chunks").strip()

# Data Path for Ingestion
raw_data_path = os.getenv("DATA_PATH", "data/data.json.example").strip()
DATA_PATH = PROJECT_ROOT / raw_data_path if not Path(raw_data_path).is_absolute() else Path(raw_data_path)

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017").strip()
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "evidentia_db").strip()

# Server Config
HOST = os.getenv("HOST", "0.0.0.0").strip()
PORT = int(os.getenv("PORT", "8000"))

# Authentication & JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "evidentia-super-secret-jwt-key-2026-nlp-kd-lab").strip()
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "0"))  # 0 = No expiration (permanent login)

# User Plan & Question Quota Configuration (Configurable, No hardcoding)
FREE_PLAN_QUESTION_LIMIT = int(os.getenv("FREE_PLAN_QUESTION_LIMIT", "5"))
PRO_PLAN_QUESTION_LIMIT = int(os.getenv("PRO_PLAN_QUESTION_LIMIT", "-1"))  # -1 = Unlimited
ENTERPRISE_PLAN_QUESTION_LIMIT = int(os.getenv("ENTERPRISE_PLAN_QUESTION_LIMIT", "-1"))  # -1 = Unlimited

PLAN_QUESTION_LIMITS = {
    "free": FREE_PLAN_QUESTION_LIMIT,
    "pro": PRO_PLAN_QUESTION_LIMIT,
    "enterprise": ENTERPRISE_PLAN_QUESTION_LIMIT,
}

def get_plan_question_limit(plan: str = "free", role: str = "user") -> int:
    """
    Get question limit for a given plan and role.
    Returns -1 if unlimited, otherwise an integer >= 0.
    """
    if role == "admin":
        return -1
    clean_plan = str(plan).lower().strip() if plan else "free"
    return PLAN_QUESTION_LIMITS.get(clean_plan, FREE_PLAN_QUESTION_LIMIT)

