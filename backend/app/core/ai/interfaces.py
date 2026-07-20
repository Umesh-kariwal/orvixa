from abc import ABC, abstractmethod
from typing import AsyncGenerator
from app.core.ai.models import AIRequest, AIResponse, AIStreamChunk


class BaseLLMProvider(ABC):
    """Abstract Base Class defining the contract for all LLM providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns the unique string identifier for this LLM provider."""
        pass

    @abstractmethod
    async def generate(self, request: AIRequest) -> AIResponse:
        """Executes a synchronous/single-turn LLM generation request asynchronously.

        Args:
            request: Standardized AIRequest object containing prompt and settings.

        Returns:
            AIResponse: Standardized response payload.
        """
        pass

    @abstractmethod
    async def generate_stream(self, request: AIRequest) -> AsyncGenerator[AIStreamChunk, None]:
        """Executes a streaming LLM generation request emitting incremental chunks.

        Args:
            request: Standardized AIRequest object containing prompt and settings.

        Yields:
            AIStreamChunk: Incremental output chunk.
        """
        pass

    @abstractmethod
    async def count_tokens(self, text: str) -> int:
        """Calculates the estimated token count for a given text string.

        Args:
            text: Text content to evaluate.

        Returns:
            int: Token count estimate.
        """
        pass
