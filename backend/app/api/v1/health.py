import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from google import genai
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


@router.get(
    "/diagnostics",
    summary="Gemini API Diagnostics",
    description="Validates loaded environment keys and runs active handshake checks against Google GenAI servers.",
)
async def get_diagnostics(current_settings: Settings = Depends(get_settings)):
    """Verifies environment files, api key parameters, and connection status."""
    key = current_settings.GEMINI_API_KEY
    key_configured = key is not None and len(key.strip()) > 0
    key_valid = False
    error_msg = None
    key_source = "None"
    
    if key_configured:
        if os.getenv("AI_GEMINI_API_KEY"):
            key_source = "AI_GEMINI_API_KEY"
        elif os.getenv("GEMINI_API_KEY"):
            key_source = "GEMINI_API_KEY"
        elif os.getenv("GOOGLE_API_KEY"):
            key_source = "GOOGLE_API_KEY"
        else:
            key_source = "Pydantic Settings / .env"
            
        try:
            # Run active dry-run generate_content test against Google servers
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model=current_settings.GEMINI_MODEL or "gemini-2.5-flash",
                contents="test connection"
            )
            if response.text:
                key_valid = True
        except Exception as e:
            error_msg = str(e)
            
    return {
        "status": "healthy",
        "backend_running": True,
        "environment": current_settings.ENVIRONMENT,
        "api_key_configured": key_configured,
        "api_key_source": key_source,
        "api_key_valid": key_valid,
        "model_configured": current_settings.GEMINI_MODEL,
        "error_message": error_msg,
    }
