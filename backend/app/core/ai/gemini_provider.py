import asyncio
import time
import uuid
from typing import Any, AsyncGenerator, Dict, Optional
from google import genai
from app.core.ai.base_provider import (
    BaseAIProvider,
    ProviderCapabilities,
    ProviderMetrics,
    StreamChunk,
)
from app.core.config import settings


class GoogleGeminiProvider(BaseAIProvider):
    """Production Google Gemini Provider implementing BaseAIProvider.

    Uses official `google-genai` SDK for streaming.
    Falls back gracefully to local stub stream if GEMINI_API_KEY is unconfigured.
    """

    def __init__(self):
        self._api_key = settings.GEMINI_API_KEY
        self._model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self._client: Optional[genai.Client] = None
        if self._api_key:
            try:
                self._client = genai.Client(api_key=self._api_key)
            except Exception:
                self._client = None

    @property
    def provider_name(self) -> str:
        return "google_gemini"

    @property
    def default_model(self) -> str:
        return self._model

    def get_capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_streaming=True,
            supports_cancellation=True,
            supports_function_calling=True,
            max_token_limit=1000000,
        )

    async def get_health(self) -> bool:
        return self._client is not None or not settings.IS_PRODUCTION

    async def stream_intent(
        self,
        context_payload: Dict[str, Any],
        intent_type: str,
        prompt_text: str,
        context_id: str,
        intent_id: str,
    ) -> AsyncGenerator[StreamChunk, None]:
        start_time = time.time()
        first_token_time: Optional[float] = None
        tokens_emitted = 0

        # Build prompt
        system_instruction = (
            "You are Orvixa Intelligence Layer. Obey Product Constitution V2. "
            "Return surgical, concise diagnostic guidance in typed intent structure."
        )

        full_prompt = f"{system_instruction}\nContext: {context_payload}\nIntent: {intent_type}\nUser Prompt: {prompt_text}"

        if self._client:
            try:
                response = self._client.models.generate_content_stream(
                    model=self._model,
                    contents=full_prompt,
                )
                for chunk in response:
                    if first_token_time is None:
                        first_token_time = time.time()

                    token_text = chunk.text or ""
                    tokens_emitted += 1

                    yield StreamChunk(
                        chunk_id=str(uuid.uuid4()),
                        context_id=context_id,
                        intent_id=intent_id,
                        token_text=token_text,
                        is_final=False,
                    )
                    await asyncio.sleep(0.01) # Yield control
            except Exception as err:
                # Fallback to local stub on API error
                yield StreamChunk(
                    chunk_id=str(uuid.uuid4()),
                    context_id=context_id,
                    intent_id=intent_id,
                    token_text=f"[Gemini Provider Exception: {str(err)}. Fallback active.] ",
                    is_final=False,
                )

        else:
            # Fallback Local Stub Stream for offline development
            sample_tokens = [
                f"Analyzing {intent_type} context... ",
                "Identified key logic pattern. ",
                "Step 1: Check array boundary before loop entry. ",
                "Step 2: Apply guarded null check. ",
                "Diagnostic complete.",
            ]

            for tok in sample_tokens:
                if first_token_time is None:
                    first_token_time = time.time()

                tokens_emitted += 1
                yield StreamChunk(
                    chunk_id=str(uuid.uuid4()),
                    context_id=context_id,
                    intent_id=intent_id,
                    token_text=tok,
                    is_final=False,
                )
                await asyncio.sleep(0.08)

        total_duration = (time.time() - start_time) * 1000
        ttft = ((first_token_time or time.time()) - start_time) * 1000

        metrics = ProviderMetrics(
            provider_name=self.provider_name,
            model_name=self._model,
            first_token_latency_ms=round(ttft, 2),
            total_duration_ms=round(total_duration, 2),
            completion_tokens=tokens_emitted,
            total_tokens=tokens_emitted + 50,
        )

        yield StreamChunk(
            chunk_id=str(uuid.uuid4()),
            context_id=context_id,
            intent_id=intent_id,
            token_text="",
            is_final=True,
            metrics=metrics,
        )
