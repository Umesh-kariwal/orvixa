from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health status response payload schema."""

    status: str = Field(example="healthy", description="Application health status")
    app_name: str = Field(example="Orvixa AI Engine", description="Application name")
    version: str = Field(example="0.1.0", description="Application semantic version")
    environment: str = Field(example="development", description="Runtime environment name")
    timestamp: datetime = Field(description="UTC timestamp of the health check response")
