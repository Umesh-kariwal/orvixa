from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional
import uuid
from app.domain.value_objects import ConceptId, DifficultyLevel, PedagogicalAction, StudentAnswer


@dataclass
class DiagnosticInsight:
    """Domain Entity representing pedagogical diagnosis for a student attempt."""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    recommended_action: PedagogicalAction = PedagogicalAction.HINT
    identified_gaps: List[ConceptId] = field(default_factory=list)
    explanation_summary: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class AttemptContext:
    """Domain Entity representing a student's active attempt on a learning platform item."""

    id: str
    tenant_id: str
    student_id: str
    question_content: str
    concept_id: ConceptId
    difficulty: DifficultyLevel
    student_answer: Optional[StudentAnswer] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def update_answer(self, answer: StudentAnswer) -> None:
        """Domain method updating the student's answer state."""
        self.student_answer = answer
