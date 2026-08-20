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
