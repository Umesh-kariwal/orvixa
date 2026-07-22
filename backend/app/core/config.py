import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Authoritatively load backend/.env into os.environ using absolute directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    """Application Settings contract managed via environment variables."""

    PROJECT_NAME: str = "Orvixa AI Engine"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = Field(default="development", description="Environment mode: development | staging | production")
    
    # AI Engine Configuration
    AI_GEMINI_API_KEY: Optional[str] = Field(default=None, description="Google Gemini API Key")
    GEMINI_MODEL: str = Field(default="gemini-3.6-flash", description="Default Gemini model name")

    # CORS Configuration
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        description="Allowed CORS origin URLs",
    )

    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Global logging level")

    @property
    def GEMINI_API_KEY(self) -> Optional[str]:
        """Resolves Gemini API Key checking environment fallbacks."""
        return (
            self.AI_GEMINI_API_KEY
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("AI_GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )

    @property
    def IS_PRODUCTION(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
