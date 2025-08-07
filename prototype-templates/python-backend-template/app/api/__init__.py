"""API package initialization."""
from fastapi import APIRouter

from app.api.v1 import auth, users, health

api_router = APIRouter()

# Include all API routes
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])