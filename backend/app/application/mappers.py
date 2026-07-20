import uuid
from app.application.dtos import DiagnoseAttemptCommand, DiagnosticResultDTO
from app.domain.entities import AttemptContext, DiagnosticInsight
from app.domain.value_objects import ConceptId, DifficultyLevel, StudentAnswer


class AttemptMapper:
    """Mapper strategy converting between application DTOs and domain entities."""

    @staticmethod
    def command_to_entity(command: DiagnoseAttemptCommand) -> AttemptContext:
        """Converts a DiagnoseAttemptCommand DTO into a pure domain AttemptContext entity."""
        attempt_id = str(uuid.uuid4())
        concept = ConceptId(value=command.concept_id)
        
        try:
            difficulty = DifficultyLevel(command.difficulty.upper())
        except ValueError:
            difficulty = DifficultyLevel.INTERMEDIATE

        student_answer = None
        if command.raw_answer is not None:
            student_answer = StudentAnswer(raw_response=command.raw_answer)

        return AttemptContext(
            id=attempt_id,
            tenant_id=command.tenant_id,
            student_id=command.student_id,
            question_content=command.question_content,
            concept_id=concept,
            difficulty=difficulty,
            student_answer=student_answer,
        )

    @staticmethod
    def entity_to_dto(insight: DiagnosticInsight, attempt_id: str) -> DiagnosticResultDTO:
        """Converts a DiagnosticInsight domain entity into a DiagnosticResultDTO."""
        return DiagnosticResultDTO(
            attempt_id=attempt_id,
            recommended_action=insight.recommended_action.value,
            identified_gaps=[gap.value for gap in insight.identified_gaps],
            explanation_summary=insight.explanation_summary,
            created_at=insight.created_at,
        )
