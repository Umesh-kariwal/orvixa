from fastapi import Depends
from app.application.ports import AIEnginePort
from app.application.use_cases import DiagnoseAttemptUseCase
from app.core.ai.interfaces import BaseLLMProvider
from app.core.config import Settings, settings
from app.infrastructure.ai.ai_engine_adapter import AIEngineAdapter
from app.infrastructure.ai.gemini_adapter import GoogleGeminiAdapter


def get_settings() -> Settings:
    """Dependency provider for application settings."""
    return settings


def get_llm_provider() -> BaseLLMProvider:
    """Dependency provider for LLM provider instance."""
    return GoogleGeminiAdapter()


def get_ai_engine_port(
    provider: BaseLLMProvider = Depends(get_llm_provider),
) -> AIEnginePort:
    """Dependency provider for AIEnginePort adapter."""
    return AIEngineAdapter(provider=provider)


def get_diagnose_use_case(
    ai_engine: AIEnginePort = Depends(get_ai_engine_port),
) -> DiagnoseAttemptUseCase:
    """Dependency provider for DiagnoseAttemptUseCase orchestrator."""
    return DiagnoseAttemptUseCase(ai_engine_port=ai_engine)
