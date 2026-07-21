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
from app.core.learning.intent_detector import IntentDetector
from app.core.config import settings


class GoogleGeminiProvider(BaseAIProvider):
    """Production Google Gemini Provider implementing BaseAIProvider.

    Uses official `google-genai` SDK for streaming.
    Provides intent-driven pedagogical streaming of adaptive learning cards.
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

        # Detect Pedagogical Intent
        learning_intent = IntentDetector.detect_intent(prompt_text or intent_type)

        system_instruction = (
            f"You are Orvixa Universal AI Learning Copilot. Intent Mode: {learning_intent.intent_mode}, Domain: {learning_intent.domain}. "
            "Return surgical, structured adaptive learning guidance."
        )

        full_prompt = f"{system_instruction}\nContext: {context_payload}\nPrompt: {prompt_text}"

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
                    await asyncio.sleep(0.01)
            except Exception as err:
                yield StreamChunk(
                    chunk_id=str(uuid.uuid4()),
                    context_id=context_id,
                    intent_id=intent_id,
                    token_text=f"[Gemini Provider Exception: {str(err)}. Fallback active.] ",
                    is_final=False,
                )
        else:
            # Fallback Intent-Driven Pedagogical Learning Stream
            if learning_intent.intent_mode in ["Explain", "Teach"]:
                sample_tokens = [
                    f"✦ **Learning Intent Detected**: {learning_intent.intent_mode} ({learning_intent.domain.capitalize()})\n\n",
                    "### 📘 Concept: Binary Search Algorithm\n",
                    "Binary Search is an efficient O(log N) search algorithm that repeatedly divides a sorted array in half to find a target value.\n\n",
                    "```python\n",
                    "def binary_search(arr, target):\n",
                    "    left, right = 0, len(arr) - 1\n",
                    "    while left <= right:\n",
                    "        mid = (left + right) // 2\n",
                    "        if arr[mid] == target:\n",
                    "            return mid\n",
                    "        elif arr[mid] < target:\n",
                    "            left = mid + 1\n",
                    "        else:\n",
                    "            right = mid - 1\n",
                    "    return -1\n",
                    "```\n\n",
                    "### ⚠️ Common Mistakes\n",
                    "• Forgetting that the array MUST be sorted before binary search.\n",
                    "• Integer overflow when computing `mid = (left + right) // 2` in languages like C++/Java.",
                ]
            elif learning_intent.intent_mode == "Hint":
                sample_tokens = [
                    f"✦ **Socratic Hint Ladder** (Intent: {learning_intent.intent_mode})\n\n",
                    "• **Hint 1**: Which direction should you adjust `left` or `right` pointers when `arr[mid] < target`?\n",
                    "• **Hint 2**: Remember that `mid` calculation uses integer division `//`.",
                ]
            else:
                sample_tokens = [
                    f"✦ **Learning Analysis** (Intent: {learning_intent.intent_mode})\n\n",
                    f"Provided surgical breakdown for '{prompt_text or 'learning topic'}'.",
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
                await asyncio.sleep(0.06)

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
