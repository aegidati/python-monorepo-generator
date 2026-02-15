export function createBackendMain(): string {
    return `"""Main application entry point."""

from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Backend API", version="0.1.0")
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Backend API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
}

export function createBackendPyprojectToml(): string {
    return `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "backend"
version = "0.1.0"
description = "Backend API"
requires-python = ">=3.8"
dependencies = [
    "fastapi>=0.68.0",
    "uvicorn[standard]>=0.15.0",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "httpx",
    "pytest-asyncio",
]
`;
}

export function createBackendRequirements(): string {
    return `fastapi>=0.68.0
uvicorn[standard]>=0.15.0
`;
}

export function createApiRoutes(): string {
    return `"""API routes."""

from fastapi import APIRouter

router = APIRouter()

@router.get("/items")
async def get_items():
    """Get all items."""
    return {"items": ["item1", "item2", "item3"]}

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get item by ID."""
    return {"item_id": item_id, "name": f"Item {item_id}"}
`;
}

export function createCoreConfig(): string {
    return `"""Core application configuration."""

import os
from typing import Optional

class Settings:
    """Application settings."""
    
    def __init__(self):
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.database_url: Optional[str] = os.getenv("DATABASE_URL")
        self.secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key")

settings = Settings()
`;
}

export function createBackendTests(): string {
    return `"""Tests for backend main module."""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend API is running!"}

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_items():
    """Test get items endpoint."""
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    assert "items" in response.json()
`;
}