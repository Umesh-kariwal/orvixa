from typing import AsyncGenerator
from app.core.ai.interfaces import BaseLLMProvider
from app.core.ai.models import AIRequest, AIResponse, AIStreamChunk, TokenUsage
from app.core.logging import logger


class GoogleGeminiAdapter(BaseLLMProvider):
    """Google Gemini LLM Provider adapter stub.

    Implements BaseLLMProvider contract. Operates in local stub mode when unconfigured,
    ensuring zero network dependency and zero credential leakage.
    """

    def __init__(self, api_key: str = "") -> None:
        self._api_key = api_key
        logger.info("Initialized GoogleGeminiAdapter (Stub Mode Active)")

    @property
    def provider_name(self) -> str:
        return "gemini"

    async def generate(self, request: AIRequest) -> AIResponse:
        """Simulates LLM response generation for student attempt diagnosis."""
        logger.info("GoogleGeminiAdapter.generate invoked for prompt length=%d", len(request.prompt))

        # Deterministic mock response for pedagogical testing
        mock_content = (
            "ACTION: HINT\n"
            "GAPS: c_algebra, c_equation_balance\n"
            "EXPLANATION: The student is missing the inverse operation step for variable isolation."
        )

        return AIResponse(
            content=mock_content,
            model_name="gemini-1.5-flash-stub",
            provider_name=self.provider_name,
            usage=TokenUsage(
                prompt_tokens=await self.count_tokens(request.prompt),
                completion_tokens=await self.count_tokens(mock_content),
                total_tokens=await self.count_tokens(request.prompt) + await self.count_tokens(mock_content),
            ),
            finish_reason="STOP",
            metadata={"stub_mode": True},
        )

    async def generate_stream(self, request: AIRequest) -> AsyncGenerator[AIStreamChunk, None]:
        """Simulates incremental chunk streaming."""
        chunks = [
            "ACTION: HINT\n",
            "GAPS: c_algebra\n",
            "EXPLANATION: Step-by-step guidance recommended.",
        ]
        for idx, chunk in enumerate(chunks):
            is_last = idx == len(chunks) - 1
            yield AIStreamChunk(
                delta=chunk,
                finish_reason="STOP" if is_last else None,
            )

    async def count_tokens(self, text: str) -> int:
        """Estimates token count for input text."""
        return max(1, len(text) // 4)
