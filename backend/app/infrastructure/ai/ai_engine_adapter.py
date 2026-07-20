from typing import Any, Dict
from app.application.ports import AIEnginePort
from app.core.ai.interfaces import BaseLLMProvider
from app.core.ai.models import AIRequest
from app.core.logging import logger
from app.domain.entities import AttemptContext, DiagnosticInsight
from app.domain.value_objects import ConceptId, PedagogicalAction


class AIEngineAdapter(AIEnginePort):
    """Adapter bridging Application AIEnginePort with LLM BaseLLMProvider interfaces."""

    def __init__(self, provider: BaseLLMProvider) -> None:
        self.provider = provider
        logger.info("Initialized AIEngineAdapter with provider: %s", provider.provider_name)

    async def analyze_attempt(
        self, attempt: AttemptContext, context_metadata: Dict[str, Any]
    ) -> DiagnosticInsight:
        """Translates AttemptContext to AIRequest, invokes LLM provider, and parses DiagnosticInsight."""
        prompt = (
            f"Question: {attempt.question_content}\n"
            f"Concept: {attempt.concept_id.value}\n"
            f"Difficulty: {attempt.difficulty.value}\n"
            f"Student Answer: {attempt.student_answer.raw_response if attempt.student_answer else 'None'}"
        )

        ai_request = AIRequest(
            prompt=prompt,
            system_instruction="You are Orvixa Pedagogical AI. Diagnose student attempts and recommend actions.",
            temperature=0.3,
        )

        ai_response = await self.provider.generate(ai_request)
        return self._parse_response(ai_response.content)

    def _parse_response(self, content: str) -> DiagnosticInsight:
        """Parses raw LLM text response into DiagnosticInsight domain entity."""
        action = PedagogicalAction.HINT
        gaps = []
        explanation = content

        lines = content.strip().split("\n")
        for line in lines:
            if line.startswith("ACTION:"):
                action_str = line.split(":", 1)[1].strip().upper()
                try:
                    action = PedagogicalAction(action_str)
                except ValueError:
                    action = PedagogicalAction.HINT
            elif line.startswith("GAPS:"):
                raw_gaps = line.split(":", 1)[1].strip().split(",")
                gaps = [ConceptId(value=g.strip()) for g in raw_gaps if g.strip()]
            elif line.startswith("EXPLANATION:"):
                explanation = line.split(":", 1)[1].strip()

        return DiagnosticInsight(
            recommended_action=action,
            identified_gaps=gaps,
            explanation_summary=explanation,
        )
