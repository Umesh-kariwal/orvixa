from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.api.deps import get_settings
from app.core.config import Settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check Endpoint",
    description="Returns current operational status, environment context, and timestamp.",
)
async def get_health(current_settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Handles health status checks for load balancers and orchestrators."""
    return HealthResponse(
        status="healthy",
        app_name=current_settings.PROJECT_NAME,
        version=current_settings.VERSION,
        environment=current_settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
    )
