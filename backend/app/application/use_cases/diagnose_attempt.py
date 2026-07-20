from app.application.dtos import DiagnoseAttemptCommand, DiagnosticResultDTO
from app.application.mappers import AttemptMapper
from app.application.ports import AIEnginePort
from app.application.use_cases.base import BaseUseCase
from app.core.logging import logger


class DiagnoseAttemptUseCase(BaseUseCase[DiagnoseAttemptCommand, DiagnosticResultDTO]):
    """Use case orchestrating student attempt diagnosis via AI engine port."""

    def __init__(self, ai_engine_port: AIEnginePort) -> None:
        self.ai_engine_port = ai_engine_port

    async def execute(self, input_dto: DiagnoseAttemptCommand) -> DiagnosticResultDTO:
        """Executes attempt diagnosis flow: DTO -> Domain Entity -> AI Port -> Result DTO."""
        logger.info(
            "DiagnoseAttemptUseCase.execute invoked for tenant=%s student=%s",
            input_dto.tenant_id,
            input_dto.student_id,
        )

        # 1. Map input Command DTO to pure Domain Entity
        attempt_context = AttemptMapper.command_to_entity(input_dto)

        # 2. Invoke AI Engine Port to generate DiagnosticInsight entity
        insight = await self.ai_engine_port.analyze_attempt(
            attempt=attempt_context,
            context_metadata={"tenant_id": input_dto.tenant_id},
        )

        # 3. Map resulting DiagnosticInsight Domain Entity to DiagnosticResultDTO
        result_dto = AttemptMapper.entity_to_dto(insight, attempt_id=attempt_context.id)

        logger.info(
            "DiagnoseAttemptUseCase completed attempt_id=%s action=%s",
            result_dto.attempt_id,
            result_dto.recommended_action,
        )
        return result_dto
