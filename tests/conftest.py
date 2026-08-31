import os

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
