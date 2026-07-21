from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, Optional
from pydantic import BaseModel, Field


class ProviderCapabilities(BaseModel):
    supports_streaming: bool = True
    supports_cancellation: bool = True
    supports_function_calling: bool = True
    max_token_limit: int = 128000


class ProviderMetrics(BaseModel):
    provider_name: str
    model_name: str
    first_token_latency_ms: float = 0.0
    total_duration_ms: float = 0.0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class StreamChunk(BaseModel):
    chunk_id: str
    context_id: str
    intent_id: str
    token_text: str
    is_final: bool = False
    structured_json_delta: Optional[Dict[str, Any]] = None
    metrics: Optional[ProviderMetrics] = None


class BaseAIProvider(ABC):
    """Abstract Base Class for all AI Providers.

    Provider-agnostic interface enforcing identical contracts across Gemini,
    Claude, OpenAI, DeepSeek, Ollama, and local models.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique provider identifier (e.g. gemini, claude, openai)."""
        pass

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model name."""
        pass

    @abstractmethod
    def get_capabilities(self) -> ProviderCapabilities:
        """Returns provider capability metadata."""
        pass

    @abstractmethod
    async def get_health(self) -> bool:
        """Checks if provider endpoint and API key are healthy."""
        pass

    @abstractmethod
    async def stream_intent(
        self,
        context_payload: Dict[str, Any],
        intent_type: str,
        prompt_text: str,
        context_id: str,
        intent_id: str,
    ) -> AsyncGenerator[StreamChunk, None]:
        """Streams intent response chunks token-by-token.

        Yields:
            StreamChunk: Incremental token chunk.
        """
        yield StreamChunk(chunk_id="", context_id="", intent_id="", token_text="")
