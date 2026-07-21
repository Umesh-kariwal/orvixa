import asyncio
import json
import uuid
from typing import Any, Dict, Optional, List
from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.ai.provider_registry import AIProviderRegistry
from app.core.security.guardian import InputValidator, PromptInjectionGuard, RateLimiter

router = APIRouter(prefix="/stream", tags=["Real-time AI Streaming Gateway"])

# Global Active Cancellation Store
cancelled_requests: set = set()


class StreamRequestSchema(BaseModel):
    context_id: str = Field(..., json_schema_extra={"example": "ctx_12345"}, description="Unique context version ID")
    intent_id: str = Field(..., json_schema_extra={"example": "intent_67890"}, description="Derived intent ID")
    intent_type: str = Field(..., json_schema_extra={"example": "CODE_DIFF_TRACE"}, description="UI intent type code")
    prompt_text: Optional[str] = Field(default="", description="Optional prompt override")
    provider_hint: Optional[str] = Field(default="google_gemini", description="Preferred AI provider key")
    context_payload: Dict[str, Any] = Field(default_factory=dict, description="Normalized context payload")
    conversation_history: List[Dict[str, str]] = Field(default_factory=list, description="Short-term conversation history memory")
    api_key: Optional[str] = Field(default=None, description="Optional custom API key configured by the user")


class CancelRequestSchema(BaseModel):
    cancel_id: str = Field(..., json_schema_extra={"example": "ctx_12345"}, description="Request or context ID to cancel")


@router.post("/cancel", status_code=status.HTTP_200_OK, summary="Cancel an active streaming request")
async def cancel_stream(payload: CancelRequestSchema):
    """Registers cancellation ID to immediately stop active streaming."""
    cancelled_requests.add(payload.cancel_id)
    return {"status": "cancelled", "cancel_id": payload.cancel_id}


@router.post("/intent", summary="Stream AI intent response token-by-token via Server-Sent Events (SSE)")
async def stream_intent(payload: StreamRequestSchema, request: Request):
    """Real-Time Streaming Gateway Endpoint.

    Streams token chunks via Server-Sent Events (SSE) `text/event-stream`.
    Supports incremental validation, heartbeats, cancellation, and context versioning.
    """
    # 1. Rate Limiting Check
    RateLimiter.check_rate_limit(request.client.host if request.client else "127.0.0.1")

    # 2. Input Validation (Oversized payload limit)
    InputValidator.validate_text(payload.prompt_text)

    # 3. Prompt Injection Shielding
    if payload.prompt_text:
        is_inj, pattern = PromptInjectionGuard.contains_injection(payload.prompt_text)
        if is_inj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security Alert: Malicious prompt injection pattern blocked."
            )

    provider = AIProviderRegistry.resolve_provider(payload.provider_hint)

    async def sse_generator():
        request_cancel_id = payload.context_id

        try:
            # Pass conversation history and optional custom API key down to stream generator
            async for chunk in provider.stream_intent(
                context_payload=payload.context_payload,
                intent_type=payload.intent_type,
                prompt_text=payload.prompt_text or "",
                context_id=payload.context_id,
                intent_id=payload.intent_id,
                conversation_history=payload.conversation_history,
                custom_api_key=payload.api_key,
            ):
                # Check for Cancellation
                if request_cancel_id in cancelled_requests:
                    cancelled_requests.remove(request_cancel_id)
                    cancel_chunk = {
                        "event": "cancelled",
                        "context_id": payload.context_id,
                        "intent_id": payload.intent_id,
                        "message": "Stream cancelled by user.",
                    }
                    yield f"data: {json.dumps(cancel_chunk)}\n\n"
                    break

                # Yield SSE Chunk
                chunk_data = {
                    "event": "token" if not chunk.is_final else "final",
                    "chunk_id": chunk.chunk_id,
                    "context_id": chunk.context_id,
                    "intent_id": chunk.intent_id,
                    "token_text": chunk.token_text,
                    "is_final": chunk.is_final,
                    "metrics": chunk.metrics.model_dump() if chunk.metrics else None,
                }

                yield f"data: {json.dumps(chunk_data)}\n\n"
                await asyncio.sleep(0.001)

            AIProviderRegistry.record_success(provider.provider_name)

        except Exception:
            AIProviderRegistry.record_failure(provider.provider_name)
            error_chunk = {
                "event": "error",
                "context_id": payload.context_id,
                "intent_id": payload.intent_id,
                "message": "Real-time AI connection failure occurred.",
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")
