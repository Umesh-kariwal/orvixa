from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    """Configuration contract for AI engine settings."""

    DEFAULT_PROVIDER: str = Field(default="gemini", description="Default active LLM provider name")
    DEFAULT_MODEL_NAME: str = Field(default="gemini-1.5-flash", description="Default active model identifier")
    REQUEST_TIMEOUT_SECONDS: int = Field(default=30, ge=1, description="LLM request execution timeout in seconds")
    MAX_RETRIES: int = Field(default=3, ge=0, description="Maximum automated retry attempts for transient errors")

    model_config = SettingsConfigDict(
        env_prefix="AI_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


ai_settings = AISettings()
