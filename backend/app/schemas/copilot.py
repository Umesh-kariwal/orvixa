from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class DiagnoseAttemptRequest(BaseModel):
    """Request payload schema for diagnosing a student attempt."""

    tenant_id: str = Field(..., example="mockpreps", description="Unique platform/tenant identifier")
    student_id: str = Field(..., example="student_101", description="Unique student/learner identifier")
    question_content: str = Field(..., example="Solve for x: x^2 - 4 = 0", description="Text of the question item")
    concept_id: str = Field(..., example="c_quadratic_equations", description="Primary learning concept identifier")
    difficulty: str = Field(default="INTERMEDIATE", example="INTERMEDIATE", description="Cognitive difficulty tier")
    raw_answer: Optional[str] = Field(default=None, example="x = 2", description="Student submitted response text")


class DiagnoseAttemptResponse(BaseModel):
    """Response payload schema returning diagnosis results."""

    attempt_id: str = Field(..., example="9925570c-1abe-4f39-bfea-da2ce179a7e7", description="Unique attempt context ID")
    recommended_action: str = Field(..., example="HINT", description="Recommended pedagogical intervention action")
    identified_gaps: List[str] = Field(default_factory=list, example=["c_algebra"], description="Identified concept gap IDs")
    explanation_summary: str = Field(..., description="Summary explanation for the student or teacher")
    created_at: datetime = Field(..., description="UTC creation timestamp")
