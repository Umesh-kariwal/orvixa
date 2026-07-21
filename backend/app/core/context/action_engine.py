from typing import List
from app.schemas.context import ConfidenceTier, NormalizedContextSchema, RecommendedActionSchema


class DynamicActionRecommendationEngine:
    """Generates contextually relevant recommended actions dynamically from context intent."""

    @classmethod
    def generate_actions(
        cls, primary_intent: str, confidence_tier: ConfidenceTier, context: NormalizedContextSchema
    ) -> List[RecommendedActionSchema]:
        """Generates dynamic actions based on intent and confidence.

        If confidence is UNKNOWN or LOW without explicit selection, returns [] (Silence Policy).
        """
        # Silence policy check
        if confidence_tier in {ConfidenceTier.UNKNOWN, ConfidenceTier.LOW} and not (
            context.active_object and context.active_object.content
        ):
            return []

        actions: List[RecommendedActionSchema] = []

        if primary_intent == "CODE_ANALYSIS":
            actions.append(
                RecommendedActionSchema(
                    action_id="explain_code",
                    label="Explain Code",
                    description="Explains selected code structure in 1 concise sentence",
                    icon="code",
                )
            )
            actions.append(
                RecommendedActionSchema(
                    action_id="trace_execution",
                    label="Trace Execution",
                    description="Traces execution flow and variable state updates",
                    icon="git-commit",
                )
            )
            actions.append(
                RecommendedActionSchema(
                    action_id="find_bugs",
                    label="Debug & Fix",
                    description="Scans selected code for edge-case bugs and suggests fix diff",
                    icon="bug",
                )
            )
        elif primary_intent == "PULL_REQUEST_REVIEW":
            actions.append(
                RecommendedActionSchema(
                    action_id="summarize_pr",
                    label="Summarize PR",
                    description="Generates concise 3-bullet pull request summary",
                    icon="file-text",
                )
            )
            actions.append(
                RecommendedActionSchema(
                    action_id="review_changes",
                    label="Review Changes",
                    description="Highlights breaking changes and potential risks",
                    icon="shield-alert",
                )
            )
        elif primary_intent == "TEXT_EXPLANATION":
            actions.append(
                RecommendedActionSchema(
                    action_id="explain_text",
                    label="Explain Highlight",
                    description="Provides clear 1-sentence breakdown of highlighted concept",
                    icon="help-circle",
                )
            )
            actions.append(
                RecommendedActionSchema(
                    action_id="summarize_selection",
                    label="Summarize Selection",
                    description="Condenses selection into 3 key takeaways",
                    icon="list",
                )
            )
        else:
            actions.append(
                RecommendedActionSchema(
                    action_id="explain_page",
                    label="Explain Page",
                    description="Provides 1-sentence overview of current page context",
                    icon="eye",
                )
            )

        return actions
