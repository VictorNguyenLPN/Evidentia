.PHONY: help install dev-backend dev-frontend dev-admin lint format test build check pre-commit-install

# Detect virtual environment automatically if present
VENV ?= .venv
BIN := $(shell if [ -d "$(VENV)/bin" ]; then echo "$(VENV)/bin/"; else echo ""; fi)
PYTHON := $(BIN)python
PIP := $(BIN)pip
RUFF := $(BIN)ruff
PYTEST := $(BIN)pytest
PRE_COMMIT := $(BIN)pre-commit

# Default target
help:
	@echo "=========================================================="
	@echo "           Evidentia Development & CI/CD Tooling          "
	@echo "=========================================================="
	@echo "  make install             - Install all dependencies (backend, dev, frontend, admin)"
	@echo "  make dev-backend         - Start FastAPI backend with auto-reload"
	@echo "  make dev-frontend        - Start Vite frontend dev server"
	@echo "  make dev-admin           - Start Vite admin-dashboard dev server"
	@echo "  make format              - Auto-format backend code with Ruff"
	@echo "  make lint                - Check code quality (Ruff for Python, ESLint for Frontend)"
	@echo "  make test                - Run Pytest backend test suite"
	@echo "  make build               - Build frontend and admin-dashboard production bundles"
	@echo "  make check               - [CI/QA] Run format-check, lint, test, and build"
	@echo "  make pre-commit-install  - Install git hooks into local .git repository"

# Install all dependencies
install:
	$(PYTHON) -m pip install --upgrade pip
	$(PIP) install -r requirements.txt -r requirements-dev.txt
	cd frontend && npm install
	cd admin-dashboard && npm install

# Run backend dev server
dev-backend:
	$(PYTHON) -m backend.main --reload

# Run frontend dev server
dev-frontend:
	cd frontend && npm run dev

# Run admin dashboard dev server
dev-admin:
	cd admin-dashboard && npm run dev

# Auto-format Python code
format:
	$(RUFF) format backend/ tests/
	$(RUFF) check --fix backend/ tests/

# Linting & Code Quality
lint:
	@echo "==> Running Ruff Linter on Backend..."
	$(RUFF) check backend/ tests/
	@echo "==> Running ESLint on Frontend..."
	cd frontend && npm run lint

# Run unit tests
test:
	@echo "==> Running Pytest Backend Test Suite..."
	$(PYTEST) --cov=backend tests/

# Build checks
build:
	@echo "==> Building Frontend..."
	cd frontend && npm run build
	@echo "==> Building Admin Dashboard..."
	cd admin-dashboard && npm run build

# Pre-commit hook installation
pre-commit-install:
	$(PRE_COMMIT) install --hook-type pre-commit --hook-type commit-msg

# Unified check: Run all checks before commit/push
check:
	@echo "==> Checking code format..."
	$(RUFF) format --check backend/ tests/
	@echo "==> Running Linters..."
	$(MAKE) lint
	@echo "==> Running Tests..."
	$(MAKE) test
	@echo "==> Checking Production Builds..."
	$(MAKE) build
	@echo "==========================================="
	@echo "  All checks passed! Ready to push code.   "
	@echo "==========================================="
