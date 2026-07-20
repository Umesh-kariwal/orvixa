from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application Settings contract managed via environment variables."""

    PROJECT_NAME: str = "Orvixa AI Engine"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", description="Environment mode: development | staging | production")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        description="Allowed CORS origin URLs",
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Global logging level")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
