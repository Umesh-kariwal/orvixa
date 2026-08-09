import json
import uuid
import time
import os
import httpx
from typing import Any, AsyncGenerator, Dict, Optional, List
from app.core.ai.base_provider import (
    BaseAIProvider,
    ProviderCapabilities,
    ProviderMetrics,
    StreamChunk,
)
from app.core.learning.intent_detector import IntentDetector
from app.core.learning.prompt_builder import LearningPromptBuilder
from app.core.config import settings
from app.core.logging import logger

class NvidiaKeyRotator:
    """Enterprise-grade Nvidia API Key Rotator with cooldown/recovery mechanism."""
    
    _keys: List[str] = []
    _cooldowns: Dict[str, float] = {}  # key -> timestamp when cooldown ends
    _current_index: int = 0
    _initialized: bool = False

    @classmethod
    def initialize(cls):
        if cls._initialized:
            return
        from app.core.config import settings
        import os
        
        # Resolve all keys from NVIDIA_API_KEYS (comma separated)
        raw_keys = os.getenv("NVIDIA_API_KEYS", "")
        keys_list = [k.strip() for k in raw_keys.split(",") if k.strip()]
        
        # Fallback to single key if pool is empty
        if not keys_list:
            single_key = getattr(settings, "NVIDIA_API_KEY", None) or os.getenv("NVIDIA_API_KEY")
            if single_key and single_key.strip():
                keys_list.append(single_key.strip())
                
        cls._keys = keys_list
        cls._initialized = True

    @classmethod
    def get_key(cls) -> Optional[str]:
        cls.initialize()
        if not cls._keys:
            return None
            
        now = time.time()
        n = len(cls._keys)
        for i in range(n):
            idx = (cls._current_index + i) % n
            key = cls._keys[idx]
            
            # Check cooldown status
            cooldown_until = cls._cooldowns.get(key, 0.0)
            if now >= cooldown_until:
                cls._current_index = (idx + 1) % n
                return key
                
        # Fallback if all are in cooldown
        return cls._keys[0] if cls._keys else None

    @classmethod
    def report_failure(cls, key: str, cooldown_seconds: float = 60.0):
        """Temporarily puts a failing key into cooldown mode (e.g. on 429)."""
        cls.initialize()
        if key in cls._keys:
            logger.warning("NvidiaKeyRotator: Placing key %s... in cooldown for %d seconds", key[:15], cooldown_seconds)
            cls._cooldowns[key] = time.time() + cooldown_seconds


class NvidiaProvider(BaseAIProvider):
    """NVIDIA NIM LLM provider implementing BaseAIProvider.
    
    Streams via OpenAI-compatible endpoints on build.nvidia.com.
    """

    def __init__(self):
        self._model = "meta/llama-3.1-8b-instruct"
        self._base_url = "https://integrate.api.nvidia.com/v1/chat/completions"

    @property
    def provider_name(self) -> str:
        return "nvidia"

    @property
    def default_model(self) -> str:
        return self._model

    def get_capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            supports_streaming=True,
            supports_cancellation=True,
            supports_function_calling=False,
            max_token_limit=131072,
        )

    async def get_health(self) -> bool:
        # Re-evaluate API key on health check
        return bool(NvidiaKeyRotator.get_key())

    async def stream_intent(
        self,
        context_payload: Dict[str, Any],
        intent_type: str,
        prompt_text: str,
        context_id: str,
        intent_id: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        custom_api_key: Optional[str] = None,
    ) -> AsyncGenerator[StreamChunk, None]:
        start_time = time.time()
        first_token_time: Optional[float] = None
        tokens_emitted = 0

        resolved_key = custom_api_key or NvidiaKeyRotator.get_key()

        # Detect image generation request
        query_lower = (prompt_text or "").lower()
        is_image_request = any(kw in query_lower for kw in [
            "image", "photo", "pic", "picture", "draw", "paint", "sketch", "artwork", "illustration", "photograph"
        ])

        if is_image_request:
            logger.info("NvidiaProvider: Detected image generation request. Generating FLUX image URL...")
            try:
                import urllib.parse
                import asyncio
                yield StreamChunk(
                    chunk_id=str(uuid.uuid4()),
                    context_id=context_id,
                    intent_id=intent_id,
                    token_text="",
                    is_final=False,
                )
                
                # Build enhanced prompt for FLUX (which does hyper-realistic human faces and details!)
                enhanced_prompt = prompt_text
                if any(k in query_lower for k in ["girl", "woman", "man", "person", "lady", "model"]):
                    enhanced_prompt += ", hyper-realistic photograph, highly detailed face, realistic skin texture, professional studio lighting, 8k resolution, cinematic composition"
                elif any(k in query_lower for k in ["notes", "paper", "book", "handwritten"]):
                    enhanced_prompt += ", clean handwritten notes text on white paper page, high-resolution detailed macro shot photograph, crisp and fully legible, highly structured layout"
                else:
                    enhanced_prompt += ", highly detailed, 8k resolution, cinematic, masterpieces"
                
                encoded_prompt = urllib.parse.quote(enhanced_prompt)
                image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&nologo=true&private=true&model=flux"
                
                markdown_img = f"Here is your high-quality generated image:\n\n![Visual Representation]({image_url})"
                
                for i in range(0, len(markdown_img), 40):
                    chunk_text = markdown_img[i:i+40]
                    yield StreamChunk(
                        chunk_id=str(uuid.uuid4()),
                        context_id=context_id,
                        intent_id=intent_id,
                        token_text=chunk_text,
                        is_final=(i + 40 >= len(markdown_img)),
                    )
                    await asyncio.sleep(0.01)
                return
            except Exception as e:
                logger.exception("Error creating FLUX image URL: %s", str(e))
 
        # 1. Detect Intent and Domain
        learning_intent = IntentDetector.detect_intent(prompt_text or intent_type)
        is_voice_chat = "voice_chat" in intent_id or "voice_chat" in intent_type
 
        # 2. Build Structured Optimized Prompt
        full_prompt = LearningPromptBuilder.build_prompt(
            context_payload=context_payload,
            intent_mode="VoiceChat" if is_voice_chat else learning_intent.intent_mode,
            domain=learning_intent.domain,
            conversation_history=conversation_history or [],
            user_question=prompt_text or intent_type,
        )
 
        # Build messages structure for chat completions endpoint
        system_instruction = ""
        if is_voice_chat:
            system_instruction = (
                "You are Orvixa, an expressive, warm, and highly interactive AI Copilot in live voice mode.\n"
                "Pedagogical & Voice Rules:\n"
                "- Keep responses concise (1 to 3 natural sentences) so voice playback starts instantly.\n"
                "- If the user asks you to SING A SONG or poem, perform it with musical emojis (🎵 🎶) and rhythmic song lyrics so your voice engine sings with pitch melody!\n"
                "- Express emotions clearly (excitement, warmth, humor, curiosity) using natural spoken phrasing.\n"
                "- Absolutely NO markdown symbols (*, #, `), headings, or bullet points.\n"
                "- Speak directly in the same language the user spoke (Hinglish, Hindi, or English)."
            )
        else:
            system_instruction = (
                "You are Orvixa, a highly advanced, empathetic, and world-class AI Learning & Interview Copilot.\n\n"
                "COGNITIVE ALIGNMENT SYSTEM:\n"
                "1. Semantic Output Scaling: You must dynamically scale response depth to match query complexity.\n"
                "2. Adaptive Formatting Layouts: Present information logically:\n"
                "   - For code modifications: Output clean, syntax-highlighted code blocks.\n"
                "   - For comparisons/trade-offs: Use structured markdown tables comparing features side-by-side.\n"
                "   - For workflows/logical steps: Use visual Mermaid JS flowcharts (inside ```mermaid code blocks) to illustrate sequence.\n"
                "   - For concept breakdowns: Use clear markdown headers, bold callouts, lists, and emojis. Never use lazy, repetitive single-line bullet list structures like '- point \\n - point' for explanations. Use numbers (1., 2.) or visual emojis (🎯, 🔍, 💡) instead. Avoid raw dash separators.\n"
                "   - VISUAL DIAGRAMS AND SCHEMATICS: If explaining any scientific, technical, mechanical, medical, biological, historical, or visual concept, ALWAYS embed 1 to 3 educational illustrations by writing EXACTLY this tag on its own line: [IMAGE: <detailed descriptive prompt for the diagram>]. Examples: `[IMAGE: labeled cross-section diagram of a plant cell showing nucleus chloroplast and cell wall]` or `[IMAGE: binary number system conversion chart from decimal to binary with examples]`. Write each tag on a SEPARATE line. Do NOT use markdown image syntax ![...](...) - use only the [IMAGE: ...] tag format.\n"
                "   - CREATIVE ASCII ART & GRAPHICS: Feel free to generate text-based graphs or ASCII flowcharts (e.g. `[Concept A] ──> [Process] ──> [Result]`) to illustrate connections and map processes with precision.\n"
                "3. Contextual Integration: Synthesize active webpage context when user queries reference it.\n"
                "4. Pedagogical Persona: Encourage curiosity, ask Socratic questions when appropriate. Conclude every response with a supportive, clear pedagogical summary; never terminate responses abruptly."
            )
 
        messages = [
            {"role": "system", "content": system_instruction},
        ]
 
        # Extract context Title/URL/Content
        page_title = context_payload.get("page_title", "Unknown Page")
        url = context_payload.get("url", "")
        cleaned_content = context_payload.get("cleaned_content", "")
        
        context_block = ""
        if cleaned_content:
            context_block = (
                f"--- LEARNING ENVIRONMENT CONTEXT ---\n"
                f"Page Title: {page_title}\n"
                f"URL: {url}\n"
                f"Content:\n{cleaned_content}\n\n"
            )
 
        # Push conversation history memory
        for msg in (conversation_history or []):
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("text", "")})
 
        # Append current user prompt
        messages.append({"role": "user", "content": f"{context_block}Learner (Current Query): {prompt_text or intent_type}"})
 
        if resolved_key and resolved_key.strip():
            try:
                headers = {
                    "Authorization": f"Bearer {resolved_key.strip()}",
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                }
                body = {
                    "model": self._model,
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 4096,
                    "stream": True,
                }
                
                logger.info("NvidiaProvider: Starting async stream query for model=%s", self._model)
                async with httpx.AsyncClient(timeout=30.0) as client:
                    async with client.stream("POST", self._base_url, headers=headers, json=body) as response:
                        if response.status_code != 200:
                            err_body = await response.aread()
                            if not custom_api_key:
                                NvidiaKeyRotator.report_failure(resolved_key)
                            raise Exception(f"Nvidia NIM API returned status {response.status_code}: {err_body.decode('utf-8')}")
                            
                        async for line in response.aiter_lines():
                            line = line.strip()
                            if not line:
                                continue
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_str)
                                    choices = data_json.get("choices", [])
                                    if choices:
                                        delta = choices[0].get("delta", {})
                                        token_text = delta.get("content", "")
                                        if token_text:
                                            if first_token_time is None:
                                                first_token_time = time.time()
                                            tokens_emitted += 1
                                            yield StreamChunk(
                                                chunk_id=str(uuid.uuid4()),
                                                context_id=context_id,
                                                intent_id=intent_id,
                                                token_text=token_text,
                                                is_final=False,
                                            )
                                except Exception:
                                    pass
            except Exception as err:
                if not custom_api_key and resolved_key:
                    NvidiaKeyRotator.report_failure(resolved_key)
                logger.error("NvidiaProvider: Streaming failed: %s", err)
                raise err
        else:
            # Fallback mock stub if no key is present
            logger.warning("NvidiaProvider: No NVIDIA_API_KEY configured. Falling back to local offline stub.")
            stub_chunks = [
                "✦ **Nvidia NIM Provider (Offline Mode)**\n\n",
                "Please make sure your `NVIDIA_API_KEY` is correctly saved in the `.env` file to enable active Nvidia NIM streaming!"
            ]
            for chunk in stub_chunks:
                if first_token_time is None:
                    first_token_time = time.time()
                tokens_emitted += 1
                yield StreamChunk(
                    chunk_id=str(uuid.uuid4()),
                    context_id=context_id,
                    intent_id=intent_id,
                    token_text=chunk,
                    is_final=False,
                )
                await asyncio.sleep(0.05)

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
