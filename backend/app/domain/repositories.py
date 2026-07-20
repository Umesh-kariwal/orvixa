from abc import ABC, abstractmethod
from typing import Optional
from app.domain.entities import AttemptContext, DiagnosticInsight


class AssessmentRepository(ABC):
    """Domain Repository Port for persisting and retrieving Attempt Contexts."""

    @abstractmethod
    async def save_attempt(self, attempt: AttemptContext) -> None:
        """Persists an AttemptContext domain entity."""
        pass

    @abstractmethod
    async def get_attempt(self, attempt_id: str) -> Optional[AttemptContext]:
        """Retrieves an AttemptContext by unique ID."""
        pass


class DiagnosticRepository(ABC):
    """Domain Repository Port for persisting Diagnostic Insights."""

    @abstractmethod
    async def save_insight(self, insight: DiagnosticInsight) -> None:
        """Persists a DiagnosticInsight domain entity."""
        pass

    @abstractmethod
    async def get_insight(self, insight_id: str) -> Optional[DiagnosticInsight]:
        """Retrieves a DiagnosticInsight by unique ID."""
        pass
