from abc import ABC, abstractmethod
from typing import Dict, Any
from app.domain.entities import AttemptContext, DiagnosticInsight


class AIEnginePort(ABC):
    """Application port interface declaring the contract for AI pedagogical reasoning."""

    @abstractmethod
    async def analyze_attempt(
        self, attempt: AttemptContext, context_metadata: Dict[str, Any]
    ) -> DiagnosticInsight:
        """Analyzes a student attempt context using AI reasoning engine to generate a DiagnosticInsight.

        Args:
            attempt: Domain AttemptContext entity.
            context_metadata: Additional application context metadata.

        Returns:
            DiagnosticInsight: Generated domain entity containing recommended action and summary.
        """
        pass
