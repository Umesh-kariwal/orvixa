from typing import List, Tuple
from app.schemas.context import ConfidenceTier, NormalizedContextSchema, RecommendedActionSchema
from app.core.context.privacy import SensitiveFieldFilter


class MultiStageIntentEngine:
    """Multi-Stage Intent & Confidence Engine.

    Evaluates DOM signals, user selections, active object types, and recent session actions.
    Ranks intent candidates and calculates confidence score & tier.
    """

    @classmethod
    def analyze_intent(cls, context: NormalizedContextSchema) -> Tuple[str, float, ConfidenceTier]:
        """Calculates primary intent, confidence score, and confidence tier.

        Returns:
            Tuple[str, float, ConfidenceTier]: (primary_intent, score, tier)
        """
        # 1. Check for sensitive field suppression
        if context.active_object and context.active_object.is_sensitive:
            return "SENSITIVE_INPUT_SUPPRESSED", 0.0, ConfidenceTier.UNKNOWN

        score = 0.20  # Base ambient score
        primary_intent = "PAGE_BROWSING"

        # Signal 1: Active selection present
        has_selection = bool(context.active_object and context.active_object.content)
        if has_selection:
            score += 0.45
            obj_type = context.active_object.object_type if context.active_object else "text"
            if obj_type in {"code_snippet", "code_diff"}:
                primary_intent = "CODE_ANALYSIS"
                score += 0.25
            else:
                primary_intent = "TEXT_EXPLANATION"
                score += 0.20

        # Signal 2: Recent user actions (e.g. error click or selection)
        if "error_click" in context.recent_actions:
            primary_intent = "DEBUG_ERROR"
            score += 0.30

        # Signal 3: Platform specific context
        if context.platform_hint == "github" and "pull" in context.url:
            if not has_selection:
                primary_intent = "PULL_REQUEST_REVIEW"
                score += 0.50

        # Clamp score between 0.0 and 1.0
        final_score = min(1.0, max(0.0, score))

        # Map to Confidence Tier
        if final_score >= 0.85:
            tier = ConfidenceTier.HIGH
        elif final_score >= 0.65:
            tier = ConfidenceTier.MEDIUM
        elif final_score >= 0.40:
            tier = ConfidenceTier.LOW
        else:
            tier = ConfidenceTier.UNKNOWN

        return primary_intent, round(final_score, 2), tier
