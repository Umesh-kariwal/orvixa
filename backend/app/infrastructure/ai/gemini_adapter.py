import asyncio
from typing import AsyncGenerator, Optional
from app.core.ai.config import ai_settings
from app.core.ai.exceptions import AIProviderException, AIRateLimitException
from app.core.ai.interfaces import BaseLLMProvider
from app.core.ai.models import AIRequest, AIResponse, AIStreamChunk, TokenUsage
from app.core.logging import logger

try:
    from google import genai
    from google.genai import types
    GEMINI_SDK_AVAILABLE = True
except ImportError:
    GEMINI_SDK_AVAILABLE = False


class GoogleGeminiAdapter(BaseLLMProvider):
    """Production Google Gemini LLM Provider Adapter.

    Implements BaseLLMProvider interface using the official Google GenAI SDK.
    Includes timeout handling, token extraction, exception mapping, and local stub fallback.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = ai_settings.DEFAULT_MODEL_NAME,
        timeout: int = ai_settings.REQUEST_TIMEOUT_SECONDS,
    ) -> None:
        self._api_key = api_key or ai_settings.api_key or ""
        self._model_name = model_name
        self._timeout = timeout
        self._client = None

        if self._api_key and GEMINI_SDK_AVAILABLE:
            try:
                self._client = genai.Client(api_key=self._api_key)
                logger.info("Initialized GoogleGeminiAdapter with live Gemini Client (%s)", self._model_name)
            except Exception as e:
                logger.warning("Failed to initialize Google GenAI Client: %s. Falling back to stub mode.", e)
        else:
            logger.info("GoogleGeminiAdapter initialized in local stub mode (No API key provided)")

    @property
    def provider_name(self) -> str:
        return "gemini"

    async def generate(self, request: AIRequest) -> AIResponse:
        """Executes a single-turn LLM generation request against Google Gemini API."""
        logger.info("GoogleGeminiAdapter.generate invoked for model=%s", self._model_name)

        # Fallback to deterministic stub mode if API key or SDK client is unavailable
        if not self._client:
            return await self._generate_stub(request)

        try:
            config = types.GenerateContentConfig(
                temperature=request.temperature,
                max_output_tokens=request.max_tokens,
                top_p=request.top_p,
                system_instruction=request.system_instruction,
            )

            # Asynchronous execution with timeout handling
            response = await asyncio.wait_for(
                self._client.aio.models.generate_content(
                    model=self._model_name,
                    contents=request.prompt,
                    config=config,
                ),
                timeout=self._timeout,
            )

            response_text = response.text or ""
            usage_data = getattr(response, "usage_metadata", None)

            prompt_tokens = getattr(usage_data, "prompt_token_count", 0) if usage_data else await self.count_tokens(request.prompt)
            completion_tokens = getattr(usage_data, "candidates_token_count", 0) if usage_data else await self.count_tokens(response_text)
            total_tokens = getattr(usage_data, "total_token_count", 0) if usage_data else (prompt_tokens + completion_tokens)

            return AIResponse(
                content=response_text,
                model_name=self._model_name,
                provider_name=self.provider_name,
                usage=TokenUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                ),
                finish_reason="STOP",
                metadata={"live_api": True},
            )

        except asyncio.TimeoutError:
            logger.error("Gemini API request timed out after %d seconds", self._timeout)
            raise AIProviderException(
                message=f"Gemini API request timed out after {self._timeout} seconds.",
                provider=self.provider_name,
                status_code=504,
            )
        except Exception as exc:
            err_msg = str(exc)
            logger.error("Gemini API error: %s", err_msg)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "Quota" in err_msg:
                raise AIRateLimitException(
                    message="Gemini API rate limit or quota exceeded.",
                    provider=self.provider_name,
                )
            raise AIProviderException(
                message=f"Gemini API execution failed: {err_msg}",
                provider=self.provider_name,
                status_code=500,
            )

    async def generate_stream(self, request: AIRequest) -> AsyncGenerator[AIStreamChunk, None]:
        """Incremental streaming generation."""
        if not self._client:
            mock_chunks = ["ACTION: HINT\n", "GAPS: c_algebra\n", "EXPLANATION: Step-by-step guidance."]
            for idx, chunk in enumerate(mock_chunks):
                yield AIStreamChunk(delta=chunk, finish_reason="STOP" if idx == len(mock_chunks) - 1 else None)
            return

        try:
            config = types.GenerateContentConfig(
                temperature=request.temperature,
                max_output_tokens=request.max_tokens,
                top_p=request.top_p,
                system_instruction=request.system_instruction,
            )
            stream_response = await self._client.aio.models.generate_content_stream(
                model=self._model_name,
                contents=request.prompt,
                config=config,
            )
            async for chunk in stream_response:
                chunk_text = chunk.text or ""
                yield AIStreamChunk(delta=chunk_text)
        except Exception as exc:
            logger.error("Gemini stream error: %s", exc)
            raise AIProviderException(message=f"Gemini streaming failed: {exc}", provider=self.provider_name)

    async def count_tokens(self, text: str) -> int:
        """Calculates token count estimate."""
        return max(1, len(text) // 4)

    async def _generate_stub(self, request: AIRequest) -> AIResponse:
        """Deterministic mock generator used when API key is unconfigured."""
        mock_content = (
            "ACTION: HINT\n"
            "GAPS: c_algebra, c_equation_balance\n"
            "EXPLANATION: The student is missing the inverse operation step for variable isolation."
        )
        return AIResponse(
            content=mock_content,
            model_name=f"{self._model_name}-stub",
            provider_name=self.provider_name,
            usage=TokenUsage(
                prompt_tokens=await self.count_tokens(request.prompt),
                completion_tokens=await self.count_tokens(mock_content),
                total_tokens=await self.count_tokens(request.prompt) + await self.count_tokens(mock_content),
            ),
            finish_reason="STOP",
            metadata={"stub_mode": True},
        )
