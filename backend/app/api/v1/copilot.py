from fastapi import APIRouter, Depends, status
from app.api.deps import get_diagnose_use_case
from app.application.dtos import DiagnoseAttemptCommand
from app.application.use_cases import DiagnoseAttemptUseCase
from app.schemas.copilot import DiagnoseAttemptRequest, DiagnoseAttemptResponse

router = APIRouter()


@router.post(
    "/diagnose",
    response_model=DiagnoseAttemptResponse,
    status_code=status.HTTP_200_OK,
    summary="Diagnose Student Attempt",
    description="Analyzes a student's attempt context using the Orvixa AI Pedagogical Engine and returns diagnostic feedback.",
)
async def diagnose_attempt(
    payload: DiagnoseAttemptRequest,
    use_case: DiagnoseAttemptUseCase = Depends(get_diagnose_use_case),
) -> DiagnoseAttemptResponse:
    """Thin controller endpoint delegating attempt diagnosis to DiagnoseAttemptUseCase."""
    command = DiagnoseAttemptCommand(
        tenant_id=payload.tenant_id,
        student_id=payload.student_id,
        question_content=payload.question_content,
        concept_id=payload.concept_id,
        difficulty=payload.difficulty,
        raw_answer=payload.raw_answer,
    )

    result_dto = await use_case.execute(command)

    return DiagnoseAttemptResponse(
        attempt_id=result_dto.attempt_id,
        recommended_action=result_dto.recommended_action,
        identified_gaps=result_dto.identified_gaps,
        explanation_summary=result_dto.explanation_summary,
        created_at=result_dto.created_at,
    )
