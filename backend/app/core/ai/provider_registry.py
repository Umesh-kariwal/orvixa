import os
from typing import Dict, List, Optional
from app.core.ai.base_provider import BaseAIProvider
from app.core.ai.gemini_provider import GoogleGeminiProvider
from app.core.ai.nvidia_provider import NvidiaProvider
from app.core.ai.reliability import CircuitBreaker, CircuitState


class AIProviderRegistry:
    """Production Provider Registry & Circuit Breaker Manager.

    Resolves AI provider by key (gemini, nvidia, etc.),
    evaluates circuit breaker health, and manages automatic fallback.
    """

    _providers: Dict[str, BaseAIProvider] = {}
    _circuit_breakers: Dict[str, CircuitBreaker] = {}
    _default_provider_name: str = "google_gemini"

    @classmethod
    def register_provider(cls, provider: BaseAIProvider):
        name = provider.provider_name
        cls._providers[name] = provider
        
        # Set a low failure threshold (1 failure) for Gemini if Nvidia key is present
        from app.core.config import settings
        nvidia_key = getattr(settings, "NVIDIA_API_KEY", None) or os.getenv("NVIDIA_API_KEY")
        threshold = 1 if (name == "google_gemini" and nvidia_key) else 5
        
        cls._circuit_breakers[name] = CircuitBreaker(failure_threshold=threshold)

    @classmethod
    def resolve_provider(cls, provider_name: Optional[str] = None) -> BaseAIProvider:
        target_name = provider_name or cls._default_provider_name
        
        # Preemptive override: if Google Gemini is requested but an Nvidia API key is configured
        # and Gemini key is missing/empty, automatically redirect to Nvidia provider.
        from app.core.config import settings
        nvidia_key = getattr(settings, "NVIDIA_API_KEY", None) or os.getenv("NVIDIA_API_KEY")
        gemini_key = settings.GEMINI_API_KEY
        
        if target_name == "google_gemini" and nvidia_key and (not gemini_key or not gemini_key.strip()):
            target_name = "nvidia"

        circuit = cls._circuit_breakers.get(target_name)

        if circuit and not circuit.allow_request():
            # Circuit OPEN: Attempt fallback provider
            fallback = cls._get_fallback_provider(target_name)
            if fallback:
                return fallback
            raise RuntimeError(f"Circuit Breaker for '{target_name}' is OPEN and no fallback provider available.")

        provider = cls._providers.get(target_name)
        if provider:
            return provider

        # Fallback to default provider
        default_provider = cls._providers.get(cls._default_provider_name)
        if default_provider:
            return default_provider

        raise RuntimeError(f"AI Provider '{target_name}' not registered.")

    @classmethod
    def _get_fallback_provider(cls, failed_name: str) -> Optional[BaseAIProvider]:
        for name, provider in cls._providers.items():
            if name != failed_name:
                cb = cls._circuit_breakers.get(name)
                if cb and cb.allow_request():
                    return provider
        return None

    @classmethod
    def record_success(cls, provider_name: str):
        cb = cls._circuit_breakers.get(provider_name)
        if cb:
            cb.record_success()

    @classmethod
    def record_failure(cls, provider_name: str):
        cb = cls._circuit_breakers.get(provider_name)
        if cb:
            cb.record_failure()


# Register default Google Gemini Provider on initialization
AIProviderRegistry.register_provider(GoogleGeminiProvider())
# Register Nvidia NIM Provider on initialization
AIProviderRegistry.register_provider(NvidiaProvider())
