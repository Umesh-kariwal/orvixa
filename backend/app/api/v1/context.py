from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.schemas.context import (
    ConfidenceTier,
    ContextIntelligenceResponse,
    NormalizedContextSchema,
)
from app.core.context.privacy import PIIRedactor
from app.core.context.adapters import AdapterRegistry
from app.core.context.intent_engine import MultiStageIntentEngine
from app.core.context.action_engine import DynamicActionRecommendationEngine
from app.core.context.universal_engine import UniversalContextEngine
from app.schemas.learning_context import LearningContextSchema

router = APIRouter(prefix="/context", tags=["Context Intelligence Engine"])


class UniversalContextRequest(BaseModel):
    raw_text: str = Field(..., description="Raw text context gathered from page elements")
    source_type: str = Field(default="generic_web", description="Context source categorization")
    url: Optional[str] = None
    page_title: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@router.post(
    "/universal",
    response_model=LearningContextSchema,
    status_code=status.HTTP_200_OK,
    summary="Process context through the Universal Context Understanding Pipeline",
)
async def process_universal_context(payload: UniversalContextRequest) -> LearningContextSchema:
    """Universal Context Engine Endpoint.

    Processes raw text through PII Masking, Boilerplate Removal, Token Compression,
    and Educational Domain Classification.
    """
    try:
        return UniversalContextEngine.process_context(
            raw_text=payload.raw_text,
            source_type=payload.source_type,
            url=payload.url,
            page_title=payload.page_title,
            metadata=payload.metadata,
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Universal Context processing failed: {str(err)}",
        )


@router.post(
    "/analyze",
    response_model=ContextIntelligenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze universal web context and return contextual intelligence",
)
async def analyze_context(payload: NormalizedContextSchema) -> ContextIntelligenceResponse:
    """Universal Context Intelligence Analysis Endpoint.

    1. Redacts PII secrets from input context via PIIRedactor.
    2. Resolves platform adapter via AdapterRegistry.
    3. Evaluates multi-stage intent and confidence tier.
    4. Generates dynamic recommended actions.
    5. Determines side panel state based on Silence Policy.
    """
    try:
        # 1. PII Redaction Step
        redacted_summary, was_redacted = PIIRedactor.sanitize(payload.visible_text_summary or "")
        if payload.active_object and payload.active_object.content:
            sanitized_content, was_content_redacted = PIIRedactor.sanitize(payload.active_object.content)
            payload.active_object.content = sanitized_content
            was_redacted = was_redacted or was_content_redacted

        # 2. Resolve Adapter
        adapter = AdapterRegistry.resolve_adapter(
            domain=payload.domain, platform_hint=payload.platform_hint
        )
        normalized_context = adapter.normalize(payload.model_dump())

        # 3. Analyze Multi-Stage Intent & Confidence Tier
        primary_intent, score, tier = MultiStageIntentEngine.analyze_intent(normalized_context)

        # 4. Generate Contextual Actions
        recommended_actions = DynamicActionRecommendationEngine.generate_actions(
            primary_intent=primary_intent,
            confidence_tier=tier,
            context=normalized_context,
        )

        # 5. Determine Side Panel State based on Silence Policy
        if tier == ConfidenceTier.HIGH:
            side_panel_state = "RECOMMENDATIONS_READY"
        elif tier == ConfidenceTier.MEDIUM:
            side_panel_state = "AURA_INDICATOR"
        elif tier == ConfidenceTier.LOW:
            side_panel_state = "DORMANT_QUIET"
        else:
            side_panel_state = "SILENT"

        return ContextIntelligenceResponse(
            confidence_tier=tier,
            confidence_score=score,
            primary_intent=primary_intent,
            recommended_actions=recommended_actions,
            side_panel_state=side_panel_state,
            redacted=was_redacted,
            sanitized_summary=redacted_summary,
        )

    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Context Intelligence Analysis failed: {str(err)}",
        )
