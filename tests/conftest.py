import os
import sys
from pathlib import Path

# Ensure project root is in sys.path for test discovery
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient

# Set testing environment variables before importing app
os.environ["ENVIRONMENT"] = "testing"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-unit-testing-32bytes-min"

from backend.main import app


@pytest.fixture
def client():
    """
    TestClient fixture for FastAPI application.
    """
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
