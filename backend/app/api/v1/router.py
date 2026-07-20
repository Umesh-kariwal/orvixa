from fastapi import APIRouter
from app.api.v1 import copilot, health

api_v1_router = APIRouter()

# Register health check endpoints
api_v1_router.include_router(health.router, tags=["Health Checks"])

# Register AI Copilot endpoints
api_v1_router.include_router(copilot.router, prefix="/copilot", tags=["AI Copilot Engine"])
